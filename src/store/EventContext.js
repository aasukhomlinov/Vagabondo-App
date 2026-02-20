import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';

const EVENTS_KEY = '@vagabondo:events';
const GOING_KEY = '@vagabondo:going';

// ---------------------------------------------------------------------------
// Mock seed data — near Rome, Italy
// ---------------------------------------------------------------------------
const SEED_EVENTS = [
  {
    id: 'evt001',
    title: "Let's explore the Borghese Gallery together!",
    category: 'museum',
    description:
      "Got a ticket for this Saturday afternoon at the Borghese Gallery. Would love some art-loving company! I'll be there 14:00–17:00. We can grab a coffee in the villa gardens after.",
    locationName: 'Galleria Borghese, Villa Borghese, Rome',
    location: { latitude: 41.9143, longitude: 12.4924 },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    authorName: 'Alex',
    social: {
      telegram: 'https://t.me/alexwanders',
      instagram: 'https://instagram.com/alexwanders',
    },
    goingCount: 3,
    replies: [
      {
        id: 'rep001',
        text: "I'd love to join! I've been meaning to see the Bernini sculptures.",
        authorName: 'Jamie',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        social: { telegram: 'https://t.me/jamieart' },
      },
      {
        id: 'rep002',
        text: 'Count me in! Which entrance are you planning to use?',
        authorName: 'Sam',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        social: { instagram: 'https://instagram.com/samsees' },
      },
    ],
  },
  {
    id: 'evt002',
    title: 'Morning run around the Colosseum 🌅',
    category: 'sports',
    description:
      'Anyone up for an early morning jog around the Colosseum and Roman Forum? Meeting at 7am near the Arch of Constantine. All paces welcome — it's more about the vibes than the speed!',
    locationName: 'Colosseo, Piazza del Colosseo, Rome',
    location: { latitude: 41.8902, longitude: 12.4922 },
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    authorName: 'Morgan',
    social: {
      instagram: 'https://instagram.com/morganruns',
      whatsapp: 'https://wa.me/391234567890',
    },
    goingCount: 7,
    replies: [
      {
        id: 'rep003',
        text: "I'll be there! Such an incredible route to run.",
        authorName: 'Taylor',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        social: { telegram: 'https://t.me/taylorfit' },
      },
    ],
  },
  {
    id: 'evt003',
    title: 'Jazz aperitivo in Trastevere 🎵',
    category: 'concert',
    description:
      "There's a free jazz night at a little bar in Trastevere tonight starting 9pm. Looking for 2-3 people to share the vibe. Drinks on the terrace, live music — classic Roman evening.",
    locationName: 'Trastevere, Rome',
    location: { latitude: 41.8882, longitude: 12.4695 },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    authorName: 'Riley',
    social: {
      telegram: 'https://t.me/rileyjazz',
    },
    goingCount: 1,
    replies: [],
  },
  {
    id: 'evt004',
    title: 'Sketching at Campo de' Fiori ☕🎨',
    category: 'art',
    description:
      "Grabbing my sketchbook and heading to Campo de' Fiori for some urban sketching. Anyone want to join? Beginners totally welcome — just bring something to draw with and enjoy the market atmosphere.",
    locationName: "Campo de' Fiori, Rome",
    location: { latitude: 41.8955, longitude: 12.4722 },
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    authorName: 'Casey',
    social: {
      instagram: 'https://instagram.com/caseydraws',
      telegram: 'https://t.me/caseydraws',
    },
    goingCount: 5,
    replies: [
      {
        id: 'rep004',
        text: "Love this idea! I'll bring my watercolors.",
        authorName: 'Jordan',
        createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        social: { instagram: 'https://instagram.com/jordanpaints' },
      },
    ],
  },
  {
    id: 'evt005',
    title: 'Street food tour through Testaccio',
    category: 'food',
    description:
      'Testaccio market is the real heart of Roman cuisine. Planning to do a self-guided street food tour this Sunday morning. Who wants to eat their way through supplì, porchetta, and maritozzi?',
    locationName: 'Mercato Testaccio, Rome',
    location: { latitude: 41.8795, longitude: 12.477 },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    authorName: 'Quinn',
    social: {
      telegram: 'https://t.me/quinnfoodlover',
      whatsapp: 'https://wa.me/390987654321',
    },
    goingCount: 2,
    replies: [
      {
        id: 'rep005',
        text: "I'm in! Testaccio is underrated. Meet at the market entrance?",
        authorName: 'Avery',
        createdAt: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
        social: { instagram: 'https://instagram.com/averytravels' },
      },
    ],
  },
  {
    id: 'evt006',
    title: 'Sunset at Pincio Hill viewpoint 🌇',
    category: 'park',
    description:
      "The sunset from Pincio is something else. Going this evening around 18:30. Bringing a blanket and some snacks. Everyone's welcome — just look for the person with the orange backpack!",
    locationName: 'Terrazza del Pincio, Rome',
    location: { latitude: 41.9115, longitude: 12.4831 },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    authorName: 'Nova',
    social: {
      instagram: 'https://instagram.com/novaroams',
    },
    goingCount: 9,
    replies: [],
  },
];

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
const initialState = {
  events: [],
  goingIds: new Set(),
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        events: action.events,
        goingIds: new Set(action.goingIds),
        loaded: true,
      };

    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };

    case 'TOGGLE_GOING': {
      const id = action.eventId;
      const newGoingIds = new Set(state.goingIds);
      const isGoing = newGoingIds.has(id);
      if (isGoing) {
        newGoingIds.delete(id);
      } else {
        newGoingIds.add(id);
      }
      const events = state.events.map((e) => {
        if (e.id !== id) return e;
        return { ...e, goingCount: e.goingCount + (isGoing ? -1 : 1) };
      });
      return { ...state, events, goingIds: newGoingIds };
    }

    case 'ADD_REPLY': {
      const events = state.events.map((e) => {
        if (e.id !== action.eventId) return e;
        return { ...e, replies: [...e.replies, action.reply] };
      });
      return { ...state, events };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [eventsRaw, goingRaw] = await Promise.all([
          AsyncStorage.getItem(EVENTS_KEY),
          AsyncStorage.getItem(GOING_KEY),
        ]);
        const events = eventsRaw ? JSON.parse(eventsRaw) : SEED_EVENTS;
        const goingIds = goingRaw ? JSON.parse(goingRaw) : [];
        dispatch({ type: 'LOAD', events, goingIds });
      } catch {
        dispatch({ type: 'LOAD', events: SEED_EVENTS, goingIds: [] });
      }
    })();
  }, []);

  // Persist events whenever they change
  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(state.events)).catch(
      () => {}
    );
  }, [state.events, state.loaded]);

  // Persist going IDs
  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(
      GOING_KEY,
      JSON.stringify([...state.goingIds])
    ).catch(() => {});
  }, [state.goingIds, state.loaded]);

  const addEvent = useCallback((eventData) => {
    const event = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      goingCount: 0,
      replies: [],
    };
    dispatch({ type: 'ADD_EVENT', event });
    return event;
  }, []);

  const toggleGoing = useCallback((eventId) => {
    dispatch({ type: 'TOGGLE_GOING', eventId });
  }, []);

  const addReply = useCallback((eventId, replyData) => {
    const reply = {
      ...replyData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REPLY', eventId, reply });
  }, []);

  const isGoing = useCallback(
    (eventId) => state.goingIds.has(eventId),
    [state.goingIds]
  );

  const getEvent = useCallback(
    (eventId) => state.events.find((e) => e.id === eventId),
    [state.events]
  );

  return (
    <EventContext.Provider
      value={{
        events: state.events,
        loaded: state.loaded,
        addEvent,
        toggleGoing,
        addReply,
        isGoing,
        getEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used within EventProvider');
  return ctx;
};

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';

const EVENTS_KEY = '@vagabondo:events_v2';
const LIKED_KEY = '@vagabondo:liked_v2';
const GOING_KEY = '@vagabondo:going_v2';

// ---------------------------------------------------------------------------
// Seed data — Rome, Italy
// ---------------------------------------------------------------------------
const SEED_EVENTS = [
  {
    id: 'evt001',
    title: 'Kedr Livanskiy',
    category: 'concert',
    venue: 'Karmakoma',
    city: 'Rome',
    dateTime: '2025-03-14T20:00:00',
    posterColor: '#A8BFCC',
    attendeeColors: ['#E8A87C', '#85C1E9', '#82E0AA'],
    description:
      "Kedr Livanskiy is bringing her dreamy electronic set to Karmakoma! Looking for 1-2 people to go together. I have an extra ticket. Drinks before at Bar San Calisto?",
    locationName: 'Karmakoma, Via Libetta 1, Rome',
    location: { latitude: 41.8750, longitude: 12.4732 },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    authorName: 'Alex',
    social: {
      telegram: 'https://t.me/alexwanders',
      instagram: 'https://instagram.com/alexwanders',
    },
    goingCount: 16,
    replies: [
      {
        id: 'rep001',
        text: "I'd love to join! Big fan of her music.",
        authorName: 'Jamie',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        social: { telegram: 'https://t.me/jamieart' },
      },
      {
        id: 'rep002',
        text: 'Count me in! What time are you getting there?',
        authorName: 'Sam',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        social: { instagram: 'https://instagram.com/samsees' },
      },
    ],
  },
  {
    id: 'evt002',
    title: 'Fields Festival',
    category: 'festival',
    venue: 'Villa Ada',
    city: 'Rome',
    dateTime: '2025-03-14T20:00:00',
    posterColor: '#1A1F35',
    attendeeColors: ['#F1948A', '#AED6F1', '#A9DFBF', '#D2B4DE'],
    description:
      "Fields is an inventive music festival at Villa Ada this summer. Still in the planning phase — looking for festival partners to coordinate camping and tickets!",
    locationName: 'Villa Ada, Via di Ponte Salario, Rome',
    location: { latitude: 41.9280, longitude: 12.5120 },
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    authorName: 'Morgan',
    social: {
      instagram: 'https://instagram.com/morganruns',
      whatsapp: 'https://wa.me/391234567890',
    },
    goingCount: 54,
    replies: [
      {
        id: 'rep003',
        text: "Been waiting for this! I'm absolutely going.",
        authorName: 'Taylor',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        social: { telegram: 'https://t.me/taylorfit' },
      },
    ],
  },
  {
    id: 'evt003',
    title: 'Tigran Hamasyan',
    category: 'concert',
    venue: 'Auditorium Parco della Musica',
    city: 'Rome',
    dateTime: '2025-04-26T20:00:00',
    posterColor: '#1C1C1C',
    attendeeColors: ['#85C1E9', '#F8C471', '#82E0AA'],
    description:
      "Tigran Hamasyan's manifeste tour hits Rome! The Armenian jazz pianist is extraordinary live. Looking for music lovers to share the experience with.",
    locationName: 'Auditorium Parco della Musica, Rome',
    location: { latitude: 41.9267, longitude: 12.4737 },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    authorName: 'Riley',
    social: { telegram: 'https://t.me/rileyjazz' },
    goingCount: 23,
    replies: [],
  },
  {
    id: 'evt004',
    title: 'Urban Sketching',
    category: 'art',
    venue: "Campo de' Fiori",
    city: 'Rome',
    dateTime: '2025-03-16T10:00:00',
    posterColor: '#2D4A3E',
    attendeeColors: ['#E8A87C', '#BB8FCE'],
    description:
      "Grabbing my sketchbook and heading to Campo de' Fiori for some urban sketching. Anyone want to join? Beginners totally welcome — just bring something to draw with.",
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
    title: 'Testaccio Street Food',
    category: 'food',
    venue: 'Mercato Testaccio',
    city: 'Rome',
    dateTime: '2025-03-17T11:00:00',
    posterColor: '#4A3728',
    attendeeColors: ['#F1948A', '#85C1E9'],
    description:
      'Testaccio market is the real heart of Roman cuisine. Planning a self-guided street food tour this Sunday morning. Supplì, porchetta, maritozzi — the full Roman breakfast.',
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
        text: "I'm in! Meet at the market entrance?",
        authorName: 'Avery',
        createdAt: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
        social: { instagram: 'https://instagram.com/averytravels' },
      },
    ],
  },
  {
    id: 'evt006',
    title: 'Sunset at Pincio',
    category: 'park',
    venue: 'Terrazza del Pincio',
    city: 'Rome',
    dateTime: '2025-03-15T18:30:00',
    posterColor: '#3D2B4A',
    attendeeColors: ['#82E0AA', '#F8C471', '#AED6F1', '#F1948A'],
    description:
      "The sunset from Pincio is something else. Going this evening around 18:30. Bringing a blanket and some snacks. Everyone's welcome — just look for the person with the orange backpack!",
    locationName: 'Terrazza del Pincio, Rome',
    location: { latitude: 41.9115, longitude: 12.4831 },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    authorName: 'Nova',
    social: { instagram: 'https://instagram.com/novaroams' },
    goingCount: 9,
    replies: [],
  },
];

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
const initialState = {
  events: [],
  likedIds: new Set(),
  goingIds: new Set(),
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        events: action.events,
        likedIds: new Set(action.likedIds),
        goingIds: new Set(action.goingIds),
        loaded: true,
      };

    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };

    case 'TOGGLE_LIKED': {
      const id = action.eventId;
      const newLikedIds = new Set(state.likedIds);
      if (newLikedIds.has(id)) newLikedIds.delete(id);
      else newLikedIds.add(id);
      return { ...state, likedIds: newLikedIds };
    }

    case 'TOGGLE_GOING': {
      const id = action.eventId;
      const newGoingIds = new Set(state.goingIds);
      const wasGoing = newGoingIds.has(id);
      if (wasGoing) newGoingIds.delete(id);
      else newGoingIds.add(id);
      const events = state.events.map((e) => {
        if (e.id !== id) return e;
        return { ...e, goingCount: e.goingCount + (wasGoing ? -1 : 1) };
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

  useEffect(() => {
    (async () => {
      try {
        const [eventsRaw, likedRaw, goingRaw] = await Promise.all([
          AsyncStorage.getItem(EVENTS_KEY),
          AsyncStorage.getItem(LIKED_KEY),
          AsyncStorage.getItem(GOING_KEY),
        ]);
        dispatch({
          type: 'LOAD',
          events: eventsRaw ? JSON.parse(eventsRaw) : SEED_EVENTS,
          likedIds: likedRaw ? JSON.parse(likedRaw) : [],
          goingIds: goingRaw ? JSON.parse(goingRaw) : [],
        });
      } catch {
        dispatch({ type: 'LOAD', events: SEED_EVENTS, likedIds: [], goingIds: [] });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(state.events)).catch(() => {});
  }, [state.events, state.loaded]);

  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(LIKED_KEY, JSON.stringify([...state.likedIds])).catch(() => {});
  }, [state.likedIds, state.loaded]);

  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(GOING_KEY, JSON.stringify([...state.goingIds])).catch(() => {});
  }, [state.goingIds, state.loaded]);

  const addEvent = useCallback((eventData) => {
    const event = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      goingCount: 0,
      attendeeColors: [],
      replies: [],
    };
    dispatch({ type: 'ADD_EVENT', event });
    return event;
  }, []);

  const toggleLiked = useCallback((eventId) => {
    dispatch({ type: 'TOGGLE_LIKED', eventId });
  }, []);

  const toggleGoing = useCallback((eventId) => {
    dispatch({ type: 'TOGGLE_GOING', eventId });
  }, []);

  const addReply = useCallback((eventId, replyData) => {
    dispatch({
      type: 'ADD_REPLY',
      eventId,
      reply: { ...replyData, id: generateId(), createdAt: new Date().toISOString() },
    });
  }, []);

  const isLiked = useCallback((eventId) => state.likedIds.has(eventId), [state.likedIds]);
  const isGoing = useCallback((eventId) => state.goingIds.has(eventId), [state.goingIds]);
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
        toggleLiked,
        toggleGoing,
        addReply,
        isLiked,
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

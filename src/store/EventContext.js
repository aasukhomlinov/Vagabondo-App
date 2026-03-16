import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';

const EVENTS_KEY = '@joint:events_v2';
const LIKED_KEY = '@joint:liked_v2';
const GOING_KEY = '@joint:going_v2';

// ---------------------------------------------------------------------------
// Seed data — Rome, Italy
// ---------------------------------------------------------------------------
const SEED_EVENTS = [
  {
    id: 'evt001',
    title: 'Kedr Livanskiy',
    category: 'concert',
    venue: 'Karmakoma',
    city: 'Belgrade',
    dateTime: '2026-03-14T20:00:00',
    posterColor: '#A8BFCC',
    posterImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
    attendeeColors: ['#E8A87C', '#85C1E9', '#82E0AA'],
    description:
      "Kedr Livanskiy is bringing her dreamy electronic set to Karmakoma! Looking for 1-2 people to go together. I have an extra ticket. Drinks before at the bar?",
    locationName: 'Karmakoma, Belgrade',
    location: { latitude: 44.8176, longitude: 20.4633 },
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
    title: 'Fields',
    category: 'festival',
    venue: 'Karmakoma',
    city: 'Belgrade',
    dateTime: '2026-03-14T20:00:00',
    posterColor: '#1A1F35',
    posterImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    attendeeColors: ['#F1948A', '#AED6F1', '#A9DFBF', '#D2B4DE'],
    description:
      "Fields is an inventive music festival. Still in the planning phase — looking for festival partners to coordinate tickets!",
    locationName: 'Karmakoma, Belgrade',
    location: { latitude: 44.8186, longitude: 20.4573 },
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    authorName: 'Morgan',
    social: {
      instagram: 'https://instagram.com/morganruns',
      whatsapp: 'https://wa.me/381601234567',
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
    venue: 'Kolarac',
    city: 'Belgrade',
    dateTime: '2026-04-26T20:00:00',
    posterColor: '#1C1C1C',
    posterImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
    attendeeColors: ['#85C1E9', '#F8C471', '#82E0AA'],
    description:
      "Tigran Hamasyan's manifeste tour hits Belgrade! The Armenian jazz pianist is extraordinary live. Looking for music lovers to share the experience with.",
    locationName: 'Kolarac Concert Hall, Belgrade',
    location: { latitude: 44.8186, longitude: 20.4600 },
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
    venue: 'Kalemegdan',
    city: 'Belgrade',
    dateTime: '2026-03-16T10:00:00',
    posterColor: '#2D4A3E',
    posterImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop',
    attendeeColors: ['#E8A87C', '#BB8FCE'],
    description:
      "Grabbing my sketchbook and heading to Kalemegdan for some urban sketching. Anyone want to join? Beginners totally welcome — just bring something to draw with.",
    locationName: 'Kalemegdan Fortress, Belgrade',
    location: { latitude: 44.8233, longitude: 20.4508 },
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
    title: 'Skadarlija Food Walk',
    category: 'food',
    venue: 'Skadarlija',
    city: 'Belgrade',
    dateTime: '2026-03-17T11:00:00',
    posterColor: '#4A3728',
    posterImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    attendeeColors: ['#F1948A', '#85C1E9'],
    description:
      'Skadarlija is the bohemian heart of Belgrade. Planning a self-guided street food tour this Sunday morning. Ćevapi, pljeskavica, burek — the full Serbian breakfast.',
    locationName: 'Skadarlija, Belgrade',
    location: { latitude: 44.8165, longitude: 20.4620 },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    authorName: 'Quinn',
    social: {
      telegram: 'https://t.me/quinnfoodlover',
      whatsapp: 'https://wa.me/381609876543',
    },
    goingCount: 2,
    replies: [
      {
        id: 'rep005',
        text: "I'm in! Meet at the entrance?",
        authorName: 'Avery',
        createdAt: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
        social: { instagram: 'https://instagram.com/averytravels' },
      },
    ],
  },
  {
    id: 'evt006',
    title: 'Sunset at Kalemegdan',
    category: 'park',
    venue: 'Kalemegdan Fortress',
    city: 'Belgrade',
    dateTime: '2026-03-15T18:30:00',
    posterColor: '#3D2B4A',
    posterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    attendeeColors: ['#82E0AA', '#F8C471', '#AED6F1', '#F1948A'],
    description:
      "The sunset from Kalemegdan is something else. Going this evening around 18:30. Bringing a blanket and some snacks. Everyone's welcome!",
    locationName: 'Kalemegdan Fortress, Belgrade',
    location: { latitude: 44.8233, longitude: 20.4508 },
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

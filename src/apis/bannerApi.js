/**
 * Banner API
 * Manages carousel banners stored in Firestore
 */

import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '~/config/firebase';

const COLLECTION_NAME = 'banners';

/**
 * Fetch all active banners
 */
const getAll = async () => {
  try {
    const bannersRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(bannersRef);
    
    let banners = [];
    snapshot.forEach((doc) => {
      banners.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by order/index if present
    banners.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (banners.length === 0) {
      // Fallback
      return { status: 'success', data: getMockBanners() };
    }
    
    return { status: 'success', data: banners };
  } catch (error) {
    console.error('Get banners error:', error);
    return {
      status: 'success',
      data: getMockBanners(),
    };
  }
};

const addBanner = async (bannerUrl, order = 0) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      image: bannerUrl,
      order: order,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    return { status: 'success', data: docRef.id };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

const deleteBanner = async (id) => {
  try {
     await deleteDoc(doc(db, COLLECTION_NAME, id));
     return { status: 'success' };
  } catch (error) {
     return { status: 'error', message: error.message };
  }
}

// Mock
const getMockBanners = () => [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop', // coffee aesthetic
    order: 0,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop', // luxury interior
    order: 1,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop', // latte art
    order: 2,
  }
];

export const bannerApi = {
  getAll,
  addBanner,
  deleteBanner
};

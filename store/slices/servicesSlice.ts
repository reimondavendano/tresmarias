import { createSlice } from '@reduxjs/toolkit';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'hair' | 'facial' | 'nails' | 'foot';
  image: string;
}

export interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  experience: number;
  rating: number;
  image: string;
  available: boolean;
}

interface ServicesState {
  services: Service[];
  stylists: Stylist[];
}

const initialState: ServicesState = {
  services: [
    {
      id: '1',
      name: 'Hair Cut & Styling',
      description: 'Professional haircut with premium styling and finishing',
      price: 120,
      duration: 90,
      category: 'hair',
      image: '/assets/gallery/12.jpg'
    },
    {
      id: '2',
      name: 'Hair Rebond (Any Length)',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/1.jpg'
    },
    {
      id: '3',
      name: 'Hair Rebond with Botox (Any Length)',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
     image: '/assets/gallery/2.jpg'
    },
    {
      id: '4',
      name: 'Hair Rebond with Brazzilian (Any Length)',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/3.jpg'
    },
    {
      id: '5',
      name: 'Hair Rebond with Color (Any Length)',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/4.jpg'
    },
    {
      id: '6',
      name: 'Hair Color (Any Length) ',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/5.jpg'
    },
    {
      id: '7',
      name: 'Color with Botox (Any Length)',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/6.jpg'
    },
    {
      id: '8',
      name: 'Color with Brazillian (Any Length)',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/7.jpg'
    },
    {
      id: '9',
      name: 'Rebond,Color,Botox or Brazillian',
      description: 'Full hair coloring service with professional highlights',
      price: 250,
      duration: 180,
      category: 'hair',
      image: '/assets/gallery/8.jpg'
    },
    {
      id: '10',
      name: 'Manicure & Pedicure',
      description: 'Complete nail care with long-lasting gel polish',
      price: 85,
      duration: 90,
      category: 'nails',
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg'
    },
    {
      id: '11',
      name: 'FootSpa',
      description: 'Complete bridal package with hair styling and makeup',
      price: 350,
      duration: 240,
      category: 'foot',
      image: '/assets/gallery/13.jpg'
    }
  ],
  stylists: [
    {
      id: '1',
      name: 'Roanne',
      specialties: ['Hair Cutting', 'Hair Styling', 'Hair Color', 'Hair Rebonding'],
      experience: 8,
      rating: 4.9,
      image: '/assets/img/3.jpg',
      available: true
    },
    {
      id: '2',
      name: 'Mhai',
      specialties: ['Hair Color', 'Highlights', 'Hair Rebonding'],
      experience: 6,
      rating: 4.8,
      image: '/assets/img/4.jpg',
      available: true
    },
    {
      id: '3',
      name: 'Lhen',
      specialties: ['Hair Cutting', 'Hair Styling', 'Hair Color', 'Hair Rebonding'],
      experience: 10,
      rating: 4.9,
      image: '/assets/img/11.png',
      available: true
    },
    {
      id: '4',
      name: 'Majoi',
      specialties: ['Hair Cutting', 'Hair Styling', 'Hair Color', 'Hair Rebonding'],
      experience: 5,
      rating: 4.7,
      image: '/assets/img/6.png',
      available: true
    },
    {
      id: '5',
      name: 'JM',
      specialties: ['Hair Cutting', 'Hair Styling', 'Hair Color', 'Hair Rebonding'],
      experience: 5,
      rating: 4.7,
      image: '/assets/img/2.jpg',
      available: true
    }
  ]
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
});

export default servicesSlice.reducer;
export interface Service {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: string;
  image: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Basic' | 'Advanced' | 'Professional';
  certification: string;
  skills: string[];
  features: string[];
  price: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Designer Dresses' | 'Bridal Collection' | 'Blouses' | 'Student Work' | 'Boutique Collection' | 'Classroom' | 'Fashion Shows';
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: 'Customer' | 'Student';
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  level: string;
  features: string[];
  popular: boolean;
  type: 'course' | 'stitching';
}

export interface StylistRequest {
  occasion: string;
  fabric: string;
  style: string;
  preference?: string;
}

export interface StylistResponse {
  concept: string;
  silhouette: string;
  necklineSleeves: string;
  embellishments: string;
  colorPalette: string;
  stylistTip: string;
  courseSuggestion: string;
}

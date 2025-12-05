import { Service } from '@/types';

export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Rebond with Color & Botox',
        description: 'Complete hair transformation package including rebonding, hair color, and botox treatment for ultimate shine and smoothness.',
        price: 0,
        duration: 240,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: 'hair',
        image: '/assets/img/color_botox.png',
        discount: 0
    },
    {
        id: '2',
        name: 'Rebond with Brazilian',
        description: 'Straighten and nourish your hair with our Rebond plus Brazilian Blowout combination.',
        price: 0,
        duration: 240,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: 'hair',
        image: '/assets/img/rebond_brazillian.png',
        discount: 0
    },
    {
        id: '3',
        name: 'Premium Hair Color',
        description: 'Vibrant and long-lasting hair color application by our expert stylists.',
        price: 0,
        duration: 120,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: 'hair',
        image: '/assets/img/hair_color.png',
        discount: 0
    },
    {
        id: '4',
        name: 'Hair Botox Treatment',
        description: 'Deep conditioning treatment that coats hair fibers with a filler, such as keratin.',
        price: 0,
        duration: 90,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: 'hair',
        image: '/assets/img/hair_with_botox.png',
        discount: 0
    },
    {
        id: '5',
        name: 'Brazilian Blowout',
        description: 'Liquid keratin formula that bonds to your hair to create a protective layer around each strand.',
        price: 0,
        duration: 120,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: 'hair',
        image: '/assets/img/brazilian_hair.png',
        discount: 0
    },
    {
        id: '6',
        name: 'Classic Rebond',
        description: 'Traditional hair straightening treatment for a sleek and manageable look.',
        price: 0,
        duration: 180,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: 'hair',
        image: '/assets/img/rebond.png',
        discount: 0
    }
];

export const bookingOptions = [
    "Rebond with Color & Botox",
    "Rebond with Brazilian",
    "Hair Color",
    "Rebond",
    "Rebond with Botox",
    "Rebond with Color",
    "Color",
    "Botox",
    "Brazilian"
];

export const testimonials = [
    {
        name: "Maria Santos",
        role: "Regular Customer",
        image: "/assets/icons/1.jpg",
        rating: 5,
        text: "Absolutely loved the Rebond with Brazilian treatment! My hair has never been this manageable. Highly recommend Tres Marias!",
        service: "Rebond with Brazilian",
        date: "Dec 01, 2024"
    },
    {
        name: "Ana Reyes",
        role: "New Client",
        image: "/assets/icons/1.jpg",
        rating: 5,
        text: "The Hair Botox was a game changer for my damaged hair. The staff were so professional and accommodating.",
        service: "Hair Botox",
        date: "Nov 28, 2024"
    },
    {
        name: "Jennifer Garcia",
        role: "Loyal Customer",
        image: "/assets/icons/1.jpg",
        rating: 5,
        text: "Been coming here for 3 years. The premium hair color service is top-notch. They really know how to mix the perfect shade.",
        service: "Premium Hair Color",
        date: "Nov 15, 2024"
    },
    {
        name: "Michelle Dizon",
        role: "Regular Customer",
        image: "/assets/icons/1.jpg",
        rating: 5,
        text: "Tres Marias never disappoints. The Classic Rebond lasts me a nice 8 months. Very satisfied!",
        service: "Classic Rebond",
        date: "Oct 30, 2024"
    },
    {
        name: "Kristine Lopez",
        role: "Client",
        image: "/assets/icons/1.jpg",
        rating: 5,
        text: "Great ambiance and safer products. I appreciate the care they take with my hair.",
        service: "Rebond with Botox",
        date: "Oct 12, 2024"
    },
    {
        name: "Bea Ramos",
        role: "VIP",
        image: "/assets/icons/1.jpg",
        rating: 5,
        text: "Professionalism at its finest. The team is skilled and friendly. Worth every peso.",
        service: "Brazilian Blowout",
        date: "Sep 25, 2024"
    }
];

export const faqs = [
    {
        question: "How long does rebonding last?",
        answer: "Our rebonding treatments typically last between 6 to 12 months, depending on your hair's natural growth and how well you maintain it."
    },
    {
        question: "Do you use authentic products?",
        answer: "Yes, we strictly use 100% authentic and high-quality salon-grade products to ensure safety and the best results for your hair."
    },
    {
        question: "Can I book appointments in advance?",
        answer: "Absolutely! We highly encourage booking in advance, especially for long treatments like Rebond, to secure your preferred slot."
    },
    {
        question: "What is your cancellation policy?",
        answer: "We appreciate a 24-hour notice for cancellations so we can offer the slot to other clients."
    },
    {
        question: "Do you offer package deals?",
        answer: "Yes, we have bundled services like 'Rebond with Color & Botox' which offer great value compared to getting services individually."
    },
    {
        question: "What aftercare products do you recommend?",
        answer: "We recommend sulfate-free shampoos and hydrating conditioners to prolong the effects of your treatment. We can suggest specific brands available at our salon."
    },
    {
        question: "Is hair color safe after rebonding?",
        answer: "We recommend waiting at least 2 weeks after rebonding before coloring your hair, unless you avail our specialized 'Rebond with Color' package which is designed to be safe."
    }
];

export const whyChooseUs = [
    {
        title: "Licensed Professionals",
        description: "Our team consists of certified and experienced hairstylists dedicated to perfection.",
        icon: "Award"
    },
    {
        title: "15 Years Trusted",
        description: "Serving the community with excellence and integrity for over a decade.",
        icon: "ShieldCheck"
    },
    {
        title: "Quality Products",
        description: "We use only premium, authentic brands to ensure the health of your hair.",
        icon: "Sparkles"
    },
    {
        title: "Satisfaction Guaranteed",
        description: "Thousands of happy clients and 5-star reviews speak for our service quality.",
        icon: "Smile"
    }
];

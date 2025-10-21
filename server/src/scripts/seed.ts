import mongoose from 'mongoose';
import User from '../models/User';
import Temple from '../models/Temple';
import Review from '../models/Review';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DEV_MONGODB_URI || "mongodb://localhost:27017/divyayatri";

// Sample Users
const sampleUsers = [
  {
    email: 'admin@divyayatri.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    authProvider: 'local',
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        push: true
      }
    }
  },
  {
    email: 'devotee1@example.com',
    password: 'password123',
    firstName: 'Ravi',
    lastName: 'Sharma',
    role: 'user',
    phone: '+91-9876543210',
    isVerified: true,
    authProvider: 'local',
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        push: false
      }
    }
  },
  {
    email: 'devotee2@example.com',
    password: 'password123',
    firstName: 'Priya',
    lastName: 'Patel',
    role: 'user',
    phone: '+91-9876543211',
    isVerified: true,
    authProvider: 'local',
    preferences: {
      language: 'hi',
      notifications: {
        email: false,
        push: true
      }
    }
  },
  {
    email: 'manager@temple.com',
    password: 'manager123',
    firstName: 'Pandit',
    lastName: 'Kumar',
    role: 'temple_manager',
    phone: '+91-9876543212',
    isVerified: true,
    authProvider: 'local',
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        push: true
      }
    }
  },
  {
    email: 'traveler@gmail.com',
    password: 'travel123',
    firstName: 'Anjali',
    lastName: 'Singh',
    role: 'user',
    phone: '+91-9876543213',
    isVerified: true,
    authProvider: 'local',
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        push: true
      }
    }
  }
];

// Sample Temples
const sampleTemples = [
  {
    name: 'Somnath Temple',
    state: 'Gujarat',
    city: 'Somnath',
    address: 'Somnath Temple, Veraval, Gujarat',
    pincode: '362268',
    lat: 20.8879,
    lng: 70.4014,
    deity: 'Lord Shiva',
    secondaryDeities: ['Parvati', 'Ganesha'],
    foundingYear: 649,
    shortHistory: 'One of the 12 Jyotirlinga shrines of Lord Shiva.',
    fullHistory: 'Somnath temple is one of the most sacred pilgrimage sites for Hindus and is the first among the twelve Jyotirlinga shrines of Shiva. The temple is located in Prabhas Patan near Veraval in Saurashtra on the western coast of Gujarat, India. The temple has been destroyed and rebuilt several times throughout history.',
    timings: {
      open: '06:00',
      close: '21:00',
      artiTimes: ['06:30', '12:00', '19:00'],
      specialTimings: [
        {
          festival: 'Mahashivratri',
          open: '00:00',
          close: '23:59'
        }
      ]
    },
    festivals: [
      {
        name: 'Mahashivratri',
        dateRule: 'Annual on Krishna Paksha Chaturdashi in Phalguna month',
        description: 'The most important festival celebrating Lord Shiva'
      },
      {
        name: 'Kartik Poornima',
        dateRule: 'Annual on Full Moon day in Kartik month',
        description: 'Special prayers and celebrations'
      }
    ],
    contact: {
      phone: '+91-2876-231-223',
      email: 'info@somnath.org',
      website: 'https://somnath.org'
    },
    images: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVtcGxlfGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVtcGxlfGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1544043984-739e85e0b5b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVtcGxlfGVufDB8fDB8fHww.jpg'
    ],
    verified: true,
    tags: ['Jyotirlinga', 'Shiva', 'Ancient', 'Pilgrimage', 'Gujarat'],
    averageRating: 4.8,
    totalReviews: 0,
    popularity: 95,
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true
    },
    facilities: ['parking', 'wheelchair_accessible', 'prasadam', 'accommodation', 'restroom'],
    nearbyPlaces: [
      {
        name: 'Triveni Sangam',
        distance: 1.2,
        type: 'attraction'
      },
      {
        name: 'Somnath Museum',
        distance: 0.5,
        type: 'attraction'
      }
    ],
    seoSlug: 'somnath-temple-gujarat',
    isActive: true
  },
  {
    name: 'Kedarnath Temple',
    state: 'Uttarakhand',
    city: 'Kedarnath',
    address: 'Kedarnath, Rudraprayag, Uttarakhand',
    pincode: '246445',
    lat: 30.7346,
    lng: 79.0669,
    deity: 'Lord Shiva',
    secondaryDeities: ['Parvati'],
    foundingYear: 800,
    shortHistory: 'One of the 12 Jyotirlinga shrines, located in the Himalayas.',
    fullHistory: 'Kedarnath Temple is a Hindu temple dedicated to Shiva. Located on the Garhwal Himalayan range near the Mandakini river, Kedarnath is located in the state of Uttarakhand, India. Due to extreme weather conditions, the temple is open to the general public only between the months of April/May and November.',
    timings: {
      open: '04:00',
      close: '19:00',
      artiTimes: ['04:30', '12:00', '18:30'],
      specialTimings: []
    },
    festivals: [
      {
        name: 'Kedarnath Yatra',
        dateRule: 'April to November',
        description: 'Annual pilgrimage season'
      }
    ],
    contact: {
      phone: '+91-1364-233-005',
      website: 'https://badrinath-kedarnath.gov.in'
    },
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8a2VkYXJuYXRofGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGltYWxheWF8ZW58MHx8MHx8fDA%3D.jpg'
    ],
    verified: true,
    tags: ['Jyotirlinga', 'Shiva', 'Himalaya', 'Pilgrimage', 'Char Dham'],
    averageRating: 4.9,
    totalReviews: 0,
    popularity: 98,
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: false,
      publicTransport: false
    },
    facilities: ['accommodation', 'restroom'],
    nearbyPlaces: [
      {
        name: 'Gaurikund',
        distance: 16,
        type: 'temple'
      },
      {
        name: 'Vasuki Tal',
        distance: 8,
        type: 'attraction'
      }
    ],
    seoSlug: 'kedarnath-temple-uttarakhand',
    isActive: true
  },
  {
    name: 'Golden Temple',
    state: 'Punjab',
    city: 'Amritsar',
    address: 'Golden Temple Rd, Atta Mandi, Katra Ahluwalia, Amritsar, Punjab',
    pincode: '143006',
    lat: 31.6200,
    lng: 74.8765,
    deity: 'Guru Granth Sahib',
    foundingYear: 1604,
    shortHistory: 'The holiest Gurdwara and the most important pilgrimage site of Sikhism.',
    fullHistory: 'Harmandir Sahib, also known as Darbar Sahib or Golden Temple, is a gurdwara located in the city of Amritsar, Punjab, India. It is the preeminent spiritual site of Sikhism. The temple is built around a man-made pool (sarovar) and was completed by Arjan, the fifth Sikh Guru, in 1604.',
    timings: {
      open: '00:00',
      close: '23:59',
      artiTimes: ['04:00', '10:00', '18:00', '21:00'],
      specialTimings: []
    },
    festivals: [
      {
        name: 'Guru Nanak Jayanti',
        dateRule: 'Annual on Kartik Poornima',
        description: 'Birth anniversary of Guru Nanak'
      },
      {
        name: 'Vaisakhi',
        dateRule: 'Annual on April 13/14',
        description: 'Sikh New Year and harvest festival'
      }
    ],
    contact: {
      phone: '+91-183-255-3957',
      website: 'https://sgpc.net'
    },
    images: [
      'https://images.unsplash.com/photo-1587474260584-136574528055?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z29sZGVuJTIwdGVtcGxlfGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z3VyZHdhcmF8ZW58MHx8MHx8fDA%3D.jpg'
    ],
    verified: true,
    tags: ['Gurdwara', 'Sikh', 'Golden', 'Pilgrimage', 'Punjab'],
    averageRating: 4.9,
    totalReviews: 0,
    popularity: 99,
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true
    },
    facilities: ['prasadam', 'accommodation', 'parking', 'wheelchair_accessible', 'restroom'],
    nearbyPlaces: [
      {
        name: 'Jallianwala Bagh',
        distance: 1.0,
        type: 'attraction'
      },
      {
        name: 'Partition Museum',
        distance: 2.5,
        type: 'attraction'
      }
    ],
    seoSlug: 'golden-temple-amritsar-punjab',
    isActive: true
  },
  {
    name: 'Jagannath Temple',
    state: 'Odisha',
    city: 'Puri',
    address: 'Grand Rd, Puri, Odisha',
    pincode: '752001',
    lat: 19.8135,
    lng: 85.8311,
    deity: 'Lord Jagannath',
    secondaryDeities: ['Balabhadra', 'Subhadra'],
    foundingYear: 1161,
    shortHistory: 'Famous for the annual Rath Yatra (Chariot Festival).',
    fullHistory: 'The Jagannath Temple in Puri is a famous Hindu temple dedicated to Jagannath, a form of Vishnu. The temple is an important pilgrimage destination for many Hindu traditions, particularly worshippers of Krishna and Vishnu, and part of the Char Dham.',
    timings: {
      open: '05:00',
      close: '22:00',
      artiTimes: ['05:30', '11:00', '12:30', '19:00', '21:30'],
      specialTimings: [
        {
          festival: 'Rath Yatra',
          open: '04:00',
          close: '23:00'
        }
      ]
    },
    festivals: [
      {
        name: 'Rath Yatra',
        dateRule: 'Annual on Ashadha Shukla Dwitiya',
        description: 'Famous chariot festival'
      },
      {
        name: 'Snana Yatra',
        dateRule: 'Annual on Jyeshtha Poornima',
        description: 'Bathing ceremony of the deities'
      }
    ],
    contact: {
      phone: '+91-6752-222-002',
      website: 'https://jagannath.nic.in'
    },
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8amFnYW5uYXRofGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHB1cml8ZW58MHx8MHx8fDA%3D.jpg'
    ],
    verified: true,
    tags: ['Jagannath', 'Vishnu', 'Rath Yatra', 'Char Dham', 'Odisha'],
    averageRating: 4.7,
    totalReviews: 0,
    popularity: 92,
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      publicTransport: true
    },
    facilities: ['prasadam', 'accommodation', 'restroom'],
    nearbyPlaces: [
      {
        name: 'Puri Beach',
        distance: 2.0,
        type: 'attraction'
      },
      {
        name: 'Konark Sun Temple',
        distance: 35,
        type: 'temple'
      }
    ],
    seoSlug: 'jagannath-temple-puri-odisha',
    isActive: true
  },
  {
    name: 'Tirupati Balaji Temple',
    state: 'Andhra Pradesh',
    city: 'Tirupati',
    address: 'Tirumala Hills, Tirupati, Andhra Pradesh',
    pincode: '517504',
    lat: 13.6833,
    lng: 79.3474,
    deity: 'Lord Venkateswara',
    secondaryDeities: ['Lakshmi', 'Bhudevi'],
    foundingYear: 300,
    shortHistory: 'One of the richest temples in the world, dedicated to Lord Venkateswara.',
    fullHistory: 'Tirumala Venkateswara Temple is a landmark Vaishnavite temple situated in the hill town of Tirumala at Tirupati in the Chittoor district of Andhra Pradesh, India. The temple is dedicated to Venkateswara, a form of Vishnu, who is believed to have appeared here to save mankind from the trials and troubles of Kali Yuga.',
    timings: {
      open: '02:30',
      close: '01:00',
      artiTimes: ['04:30', '06:30', '09:00', '12:30', '18:00', '20:00'],
      specialTimings: []
    },
    festivals: [
      {
        name: 'Brahmotsavam',
        dateRule: 'Annual in September',
        description: 'Nine-day festival celebrated grandly'
      },
      {
        name: 'Vaikunta Ekadasi',
        dateRule: 'Annual on Margashira Shukla Ekadasi',
        description: 'Most auspicious day for darshan'
      }
    ],
    contact: {
      phone: '+91-877-227-7777',
      email: 'contact@tirumala.org',
      website: 'https://tirumala.org'
    },
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHRpcnVwYXRpfGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1544043984-739e85e0b5b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHZlbmthdGVzd2FyYXxlbnwwfHwwfHx8MA%3D%3D.jpg'
    ],
    verified: true,
    tags: ['Venkateswara', 'Vishnu', 'Rich Temple', 'Andhra Pradesh', 'Hills'],
    averageRating: 4.8,
    totalReviews: 0,
    popularity: 96,
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true
    },
    facilities: ['accommodation', 'prasadam', 'parking', 'wheelchair_accessible', 'restroom'],
    nearbyPlaces: [
      {
        name: 'Akasa Ganga Falls',
        distance: 5,
        type: 'attraction'
      },
      {
        name: 'Padmavathi Temple',
        distance: 20,
        type: 'temple'
      }
    ],
    seoSlug: 'tirupati-balaji-temple-andhra-pradesh',
    isActive: true
  }
];

// Sample Reviews
const sampleReviews = [
  {
    rating: 5,
    title: 'Divine Experience at Somnath',
    comment: 'Visiting Somnath temple was a truly divine experience. The evening aarti is mesmerizing and the ocean view adds to the spiritual ambiance. The temple is well-maintained and the staff is very helpful.',
    visitDate: new Date('2024-08-15'),
    isVerified: true,
    isApproved: true,
    helpfulVotes: 12,
    images: []
  },
  {
    rating: 5,
    title: 'Peaceful and Serene',
    comment: 'The Golden Temple is absolutely breathtaking. The free langar service is amazing and the entire atmosphere is so peaceful. A must-visit place for everyone regardless of religion.',
    visitDate: new Date('2024-09-01'),
    isVerified: true,
    isApproved: true,
    helpfulVotes: 18,
    images: []
  },
  {
    rating: 4,
    title: 'Challenging but Rewarding Trek',
    comment: 'The trek to Kedarnath is tough but absolutely worth it. The natural beauty and spiritual energy of the place is unmatched. Make sure to be physically prepared for the journey.',
    visitDate: new Date('2024-06-20'),
    isVerified: true,
    isApproved: true,
    helpfulVotes: 8,
    images: []
  },
  {
    rating: 5,
    title: 'Incredible Rath Yatra Experience',
    comment: 'Witnessed the Rath Yatra at Jagannath Temple. The energy and devotion of millions of devotees is incredible. The organization and management during the festival is commendable.',
    visitDate: new Date('2024-07-07'),
    isVerified: true,
    isApproved: true,
    helpfulVotes: 15,
    images: []
  },
  {
    rating: 4,
    title: 'Lord Venkateswara Blessings',
    comment: 'Long queues but worth the wait. The darshan of Lord Venkateswara is truly blessed. The temple management and facilities are excellent. Book online to save time.',
    visitDate: new Date('2024-10-01'),
    isVerified: true,
    isApproved: true,
    helpfulVotes: 10,
    images: []
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Temple.deleteMany({});
    await Review.deleteMany({});

    // Create users with hashed passwords
    console.log('Creating users...');
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create temples
    console.log('Creating temples...');
    const temples = [];
    for (const templeData of sampleTemples) {
      const temple = new Temple({
        ...templeData,
        createdBy: users[0]._id, // Admin user
        lastUpdated: new Date()
      });
      await temple.save();
      temples.push(temple);
      console.log(`Created temple: ${temple.name}`);
    }

    // Create reviews
    console.log('Creating reviews...');
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const review = new Review({
        ...reviewData,
        user: users[(i % 4) + 1]._id, // Rotate between devotee users
        temple: temples[i]._id
      });
      await review.save();
      
      // Update temple's review stats
      const temple = temples[i];
      temple.totalReviews += 1;
      temple.averageRating = reviewData.rating; // Simplified for seed data
      await temple.save();
      
      console.log(`Created review for: ${temple.name}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Seed Summary:');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`🏛️  Temples created: ${temples.length}`);
    console.log(`⭐ Reviews created: ${sampleReviews.length}`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('Admin: admin@divyayatri.com / admin123');
    console.log('User: devotee1@example.com / password123');
    console.log('Manager: manager@temple.com / manager123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
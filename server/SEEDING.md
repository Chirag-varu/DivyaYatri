# Database Seeding Guide

This guide explains how to populate your DivyaYatri database with sample data for testing and demonstration purposes.

## What Gets Seeded

The seed script populates your database with:

### 👥 Users (5 total)
- **Admin User**: `admin@divyayatri.com` / `admin123`
- **Regular Users**: 
  - `devotee1@example.com` / `password123` (Ravi Sharma)
  - `devotee2@example.com` / `password123` (Priya Patel)
  - `traveler@gmail.com` / `travel123` (Anjali Singh)
- **Temple Manager**: `manager@temple.com` / `manager123` (Pandit Kumar)

### 🏛️ Temples (5 total)
1. **Somnath Temple** (Gujarat) - Jyotirlinga shrine
2. **Kedarnath Temple** (Uttarakhand) - Himalayan shrine
3. **Golden Temple** (Punjab) - Sikh Gurdwara
4. **Jagannath Temple** (Odisha) - Famous for Rath Yatra
5. **Tirupati Balaji Temple** (Andhra Pradesh) - Richest temple

### ⭐ Reviews (5 total)
- Sample reviews for each temple with ratings 4-5 stars
- Includes realistic comments and helpful vote counts

## How to Run the Seed Script

### Option 1: Using npm script (Recommended)
```bash
cd server
npm run seed
```

### Option 2: Direct execution
```bash
cd server
ts-node src/scripts/seed.ts
```

### Option 3: Using the runner script
```bash
cd server
node src/scripts/runSeed.js
```

## Environment Setup

Make sure you have these environment variables set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/divyayatri
# or your MongoDB connection string
```

## Important Notes

⚠️ **Warning**: This script will **DELETE ALL EXISTING DATA** before seeding new data. Make sure you're running this on a development database only!

✅ The script will:
- Connect to your MongoDB database
- Clear all existing users, temples, and reviews
- Create fresh sample data
- Disconnect from the database

## Testing the Seeded Data

After seeding, you can:

1. **Login as Admin**:
   - Email: `admin@divyayatri.com`
   - Password: `admin123`

2. **Login as Regular User**:
   - Email: `devotee1@example.com` 
   - Password: `password123`

3. **Explore Temples**:
   - Browse the 5 seeded temples
   - View reviews and ratings
   - Test booking functionality

4. **API Testing**:
   - Use the seeded data to test all API endpoints
   - Verify authentication with seeded users
   - Test temple search and filtering

## Customizing Seed Data

To add more seed data or modify existing data:

1. Edit `src/scripts/seed.ts`
2. Add new entries to:
   - `sampleUsers` array
   - `sampleTemples` array  
   - `sampleReviews` array
3. Run the seed script again

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**:
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env file

2. **Permission Errors**:
   - Make sure you have write permissions to the database

3. **TypeScript Errors**:
   - Ensure all dependencies are installed: `npm install`
   - Check if ts-node is available globally or locally

### Getting Help

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify your MongoDB connection
3. Ensure all required dependencies are installed

---

🎉 **Happy Testing!** Your DivyaYatri app should now have rich sample data to work with.
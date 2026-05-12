use("TrickyTrayMongo");

// ניקוי collections קיימים
db.buyers.deleteMany({});
db.donors.deleteMany({});
db.gifts.deleteMany({});
db.orders.deleteMany({});

// Buyers
db.buyers.insertMany([
  {
    _id: 1,
    name: "Sara Cohen",
    email: "sara@example.com",
    phone: "0501234567"
  },
  {
    _id: 2,
    name: "David Levi",
    email: "david@example.com",
    phone: "0529876543"
  }
]);

// Donors
db.donors.insertMany([
  {
    _id: 1,
    name: "Coffee Elite"
  },
  {
    _id: 2,
    name: "Gift Center"
  }
]);

// Gifts
db.gifts.insertMany([
  {
    _id: 1,
    name: "Coffee Machine",
    category: "Kitchen",
    price: 450,
    donorId: 1,
    donorName: "Coffee Elite"
  },
  {
    _id: 2,
    name: "Luxury Blanket",
    category: "Home",
    price: 180,
    donorId: 2,
    donorName: "Gift Center"
  },
  {
    _id: 3,
    name: "Chocolate Box",
    category: "Food",
    price: 90,
    donorId: 1,
    donorName: "Coffee Elite"
  }
]);

// Orders
db.orders.insertMany([
  {
    _id: 1,
    buyerId: 1,
    buyerName: "Sara Cohen",
    status: "Confirmed",
    orderDate: new Date("2026-05-01"),
    gifts: [
      {
        giftId: 1,
        giftName: "Coffee Machine",
        price: 450
      },
      {
        giftId: 3,
        giftName: "Chocolate Box",
        price: 90
      }
    ],
    totalPrice: 540
  },
  {
    _id: 2,
    buyerId: 2,
    buyerName: "David Levi",
    status: "Draft",
    orderDate: new Date("2026-05-10"),
    gifts: [
      {
        giftId: 2,
        giftName: "Luxury Blanket",
        price: 180
      }
    ],
    totalPrice: 180
  }
]);
export const MOCK = {
  stats: {
    totalUsers:         4821,
    activeToday:        312,
    totalRevenue:       48750000,
    revenueToday:       1240000,
    totalBookings:      9203,
    bookingsToday:      74,
    flaggedUsers:       3,
    pendingKYC:         38,
    totalWalletBalance: 92400000,
  },

  users: [
    {
      _id: "u001", name: "Adaeze Okonkwo", email: "adaeze@gmail.com",
      phone: "+2348012345678", status: "active", role: "user",
      wallet: { balance: { available: 85400, bonus: 5000 }, accountStatus: "active", debt: { amount: 0 } },
      bookingStats: { totalBookings: 14, bookingsByType: { flights: 3, rides: 8, esims: 2, hotels: 1, food: 0 } },
      createdAt: "2024-11-12T10:22:00Z", auth: { lastLogin: "2025-03-03T08:15:00Z" }, kyc: { tier: 2 },
    },
    {
      _id: "u002", name: "Emeka Nwosu", email: "emeka.n@outlook.com",
      phone: "+2348098765432", status: "active", role: "user",
      wallet: { balance: { available: 0, bonus: 0 }, accountStatus: "in_debt", debt: { amount: 3200, reason: "Balance changed during ride" } },
      bookingStats: { totalBookings: 7, bookingsByType: { flights: 0, rides: 7, esims: 0, hotels: 0, food: 0 } },
      createdAt: "2025-01-05T14:30:00Z", auth: { lastLogin: "2025-03-02T19:44:00Z" }, kyc: { tier: 1 },
    },
    {
      _id: "u003", name: "Fatima Al-Hassan", email: "fatima.ah@yahoo.com",
      phone: "+2348134567890", status: "suspended", role: "user",
      wallet: { balance: { available: 125000, bonus: 0 }, accountStatus: "suspended", debt: { amount: 0 } },
      bookingStats: { totalBookings: 22, bookingsByType: { flights: 8, rides: 5, esims: 6, hotels: 3, food: 0 } },
      createdAt: "2024-09-20T09:00:00Z", auth: { lastLogin: "2025-02-28T11:20:00Z" }, kyc: { tier: 3 },
    },
    {
      _id: "u004", name: "Tunde Bakare", email: "tundeb@proton.me",
      phone: "+2348055556666", status: "active", role: "user",
      wallet: { balance: { available: 42000, bonus: 2500 }, accountStatus: "active", debt: { amount: 0 } },
      bookingStats: { totalBookings: 5, bookingsByType: { flights: 2, rides: 2, esims: 1, hotels: 0, food: 0 } },
      createdAt: "2025-02-14T16:00:00Z", auth: { lastLogin: "2025-03-04T07:30:00Z" }, kyc: { tier: 1 },
    },
    {
      _id: "u005", name: "Chioma Eze", email: "chioma.eze@gmail.com",
      phone: "+2348167890123", status: "active", role: "user",
      wallet: { balance: { available: 320000, bonus: 10000 }, accountStatus: "active", debt: { amount: 0 } },
      bookingStats: { totalBookings: 41, bookingsByType: { flights: 18, rides: 12, esims: 8, hotels: 3, food: 0 } },
      createdAt: "2024-07-01T08:00:00Z", auth: { lastLogin: "2025-03-04T06:00:00Z" }, kyc: { tier: 3 },
    },
    {
      _id: "u006", name: "Ibrahim Musa", email: "ibra.musa@mail.com",
      phone: "+2348022334455", status: "active", role: "user",
      wallet: { balance: { available: 15000, bonus: 0 }, accountStatus: "active", debt: { amount: 0 } },
      bookingStats: { totalBookings: 3, bookingsByType: { flights: 1, rides: 2, esims: 0, hotels: 0, food: 0 } },
      createdAt: "2025-03-01T12:00:00Z", auth: { lastLogin: "2025-03-03T14:00:00Z" }, kyc: { tier: 0 },
    },
    {
      _id: "u007", name: "Ngozi Adeleke", email: "ngozi.a@gmail.com",
      phone: "+2348077889900", status: "active", role: "user",
      wallet: { balance: { available: 67000, bonus: 0 }, accountStatus: "active", debt: { amount: 0 } },
      bookingStats: { totalBookings: 9, bookingsByType: { flights: 4, rides: 3, esims: 2, hotels: 0, food: 0 } },
      createdAt: "2024-12-10T11:00:00Z", auth: { lastLogin: "2025-03-01T09:00:00Z" }, kyc: { tier: 2 },
    },
  ],

  transactions: [
    { _id:"t001", userId:"u001", userName:"Adaeze Okonkwo",   reference:"MNFY_20250303_001",        type:"deposit",        amount:50000,   status:"successful", provider:"monnify",     description:"Wallet funding",        timestamp:"2025-03-03T09:00:00Z", balanceBefore:35400,  balanceAfter:85400  },
    { _id:"t002", userId:"u002", userName:"Emeka Nwosu",      reference:"RIDE-60a1b2-1709500000",   type:"ride_payment",   amount:-4800,   status:"successful", provider:"internal",    description:"Ride payment",          timestamp:"2025-03-02T18:30:00Z", balanceBefore:4800,   balanceAfter:0      },
    { _id:"t003", userId:"u005", userName:"Chioma Eze",       reference:"FLIGHT-ABC123-1709400000", type:"flight_payment", amount:-185000, status:"successful", provider:"amadeus",     description:"Flight: LOS → ABJ",     timestamp:"2025-03-01T11:00:00Z", balanceBefore:505000, balanceAfter:320000 },
    { _id:"t004", userId:"u004", userName:"Tunde Bakare",     reference:"ESIM-ORD99-1709300000",    type:"esim_purchase",  amount:-8500,   status:"successful", provider:"airalo",      description:"eSIM: Ghana 5GB",       timestamp:"2025-02-28T14:00:00Z", balanceBefore:50500,  balanceAfter:42000  },
    { _id:"t005", userId:"u001", userName:"Adaeze Okonkwo",   reference:"BONUS_1709200000",         type:"bonus",          amount:5000,    status:"successful", provider:"internal",    description:"Referral bonus",        timestamp:"2025-02-27T10:00:00Z", balanceBefore:80400,  balanceAfter:85400  },
    { _id:"t006", userId:"u003", userName:"Fatima Al-Hassan", reference:"WTD-u003-1709100000",      type:"withdrawal",     amount:-25000,  status:"pending",    provider:"flutterwave", description:"Withdrawal to GTBank",  timestamp:"2025-02-26T16:00:00Z", balanceBefore:150000, balanceAfter:125000 },
    { _id:"t007", userId:"u005", userName:"Chioma Eze",       reference:"MNFY_20250225_007",        type:"deposit",        amount:200000,  status:"successful", provider:"monnify",     description:"Wallet funding",        timestamp:"2025-02-25T08:00:00Z", balanceBefore:305000, balanceAfter:505000 },
    { _id:"t008", userId:"u006", userName:"Ibrahim Musa",     reference:"RIDE-60d4e5-1709000000",   type:"ride_payment",   amount:-3200,   status:"failed",     provider:"internal",    description:"Ride payment",          timestamp:"2025-02-24T20:00:00Z", balanceBefore:18200,  balanceAfter:18200  },
    { _id:"t009", userId:"u007", userName:"Ngozi Adeleke",    reference:"FLIGHT-DEF456-1708900000", type:"flight_payment", amount:-72000,  status:"successful", provider:"amadeus",     description:"Flight: ABJ → LOS",     timestamp:"2025-02-23T12:00:00Z", balanceBefore:139000, balanceAfter:67000  },
    { _id:"t010", userId:"u004", userName:"Tunde Bakare",     reference:"MNFY_20250222_010",        type:"deposit",        amount:50000,   status:"successful", provider:"monnify",     description:"Wallet funding",        timestamp:"2025-02-22T09:00:00Z", balanceBefore:0,      balanceAfter:50000  },
  ],

  bookings: [
    { _id:"b001", userId:"u001", userName:"Adaeze Okonkwo",   type:"flight", status:"completed", amount:95000,  details:{ route:"LOS → ABJ", airline:"Air Peace",  pnr:"AP7743",  date:"2025-02-20" },                                  createdAt:"2025-02-18T10:00:00Z" },
    { _id:"b002", userId:"u002", userName:"Emeka Nwosu",      type:"ride",   status:"completed", amount:4800,   details:{ pickup:"Lekki Phase 1", dropoff:"VI", boltRideId:"BOLT_12345" },                                                createdAt:"2025-03-02T18:00:00Z" },
    { _id:"b003", userId:"u005", userName:"Chioma Eze",       type:"flight", status:"confirmed", amount:185000, details:{ route:"LOS → ABJ", airline:"Ibom Air",   pnr:"IB2291",  date:"2025-03-10" },                                  createdAt:"2025-03-01T11:00:00Z" },
    { _id:"b004", userId:"u004", userName:"Tunde Bakare",     type:"esim",   status:"completed", amount:8500,   details:{ package:"Ghana 5GB/30d", iccid:"8923...5623", country:"Ghana" },                                               createdAt:"2025-02-28T14:00:00Z" },
    { _id:"b005", userId:"u003", userName:"Fatima Al-Hassan", type:"hotel",  status:"cancelled", amount:45000,  details:{ hotel:"Transcorp Hilton", city:"Abuja", checkIn:"2025-03-01", checkOut:"2025-03-03" },                          createdAt:"2025-02-20T09:00:00Z" },
    { _id:"b006", userId:"u005", userName:"Chioma Eze",       type:"esim",   status:"completed", amount:12000,  details:{ package:"SA 10GB/30d", iccid:"8923...9871", country:"South Africa" },                                          createdAt:"2025-02-15T12:00:00Z" },
    { _id:"b007", userId:"u001", userName:"Adaeze Okonkwo",   type:"ride",   status:"completed", amount:2100,   details:{ pickup:"Ikeja", dropoff:"Maryland", boltRideId:"BOLT_67890" },                                                 createdAt:"2025-02-10T07:30:00Z" },
    { _id:"b008", userId:"u007", userName:"Ngozi Adeleke",    type:"flight", status:"completed", amount:72000,  details:{ route:"ABJ → LOS", airline:"Dana Air",   pnr:"DA9921",  date:"2025-02-23" },                                  createdAt:"2025-02-21T08:00:00Z" },
  ],

  flagged: [
    {
      userId:"f001", name:"Kingsley Obi",   email:"king.obi@gmail.com",  severity:"critical",
      flagReason:"3rd 90k+ transaction — PERMANENT block",
      balance:{ available:90000 },
      flags:{ permanent90kFlag:true, permanent90kFlaggedAt:"2025-03-03T22:00:00Z", highAmountCount:3, adminReviewed:false, rapidTransactionFlag:false, temporary90kFlag:false },
      recentTransactions:[
        { type:"deposit", amount:92000, timestamp:"2025-03-03T22:00:00Z" },
        { type:"deposit", amount:95000, timestamp:"2025-03-02T18:00:00Z" },
        { type:"deposit", amount:90000, timestamp:"2025-03-01T10:00:00Z" },
      ],
    },
    {
      userId:"f002", name:"Sandra Ojo",     email:"sandra.ojo@mail.com", severity:"high",
      flagReason:"2nd 90k+ transaction — Temp 30min block",
      balance:{ available:185000 },
      flags:{ permanent90kFlag:false, temporary90kFlag:true, temp90kExpiresAt:"2025-03-04T01:30:00Z", highAmountCount:2, adminReviewed:false, rapidTransactionFlag:false },
      recentTransactions:[
        { type:"deposit", amount:91000, timestamp:"2025-03-04T01:00:00Z" },
        { type:"deposit", amount:94000, timestamp:"2025-03-03T09:00:00Z" },
      ],
    },
    {
      userId:"f003", name:"Biodun Afolabi", email:"bio.afo@yahoo.com",   severity:"medium",
      flagReason:"3 rapid transactions in 5-min window",
      balance:{ available:45000 },
      flags:{ permanent90kFlag:false, temporary90kFlag:false, rapidTransactionFlag:true, rapidFlagExpiresAt:"2025-03-04T02:00:00Z", rapidTransactionCount:3, highAmountCount:0, adminReviewed:false },
      recentTransactions:[
        { type:"deposit", amount:15000, timestamp:"2025-03-04T01:30:00Z" },
        { type:"deposit", amount:10000, timestamp:"2025-03-04T01:28:00Z" },
        { type:"deposit", amount:20000, timestamp:"2025-03-04T01:25:00Z" },
      ],
    },
  ],
};
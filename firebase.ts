import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { getAuth, GoogleAuthProvider } from "firebase/auth";
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Data Seeding Logic (Temporary)
import { collection, doc, setDoc, writeBatch } from "firebase/firestore"; 

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  // 1. Teams Data
  const teams = [
    { id: "team_1", name: "Đội 1", members: [{ name: "Khoa", level: 3 }, { name: "Dung", level: 1 }], group: "A" },
    { id: "team_2", name: "Đội 2", members: [{ name: "A.Cường", level: 3 }, { name: "Tiên", level: 1 }], group: "B" },
    { id: "team_3", name: "Đội 3", members: [{ name: "A.Hiếu Nguyễn", level: 3 }, { name: "Ly", level: 1 }], group: "B" },
    { id: "team_4", name: "Đội 4", members: [{ name: "Hiếu Trần", level: 3 }, { name: "Hùng Nguyễn", level: 1 }], group: "A" },
    { id: "team_5", name: "Đội 5", members: [{ name: "Phúc", level: 3 }, { name: "Tuyền", level: 1 }], group: "A" },
    { id: "team_6", name: "Đội 6", members: [{ name: "Thùy", level: 2 }, { name: "Hiếu NPM", level: 2 }], group: "A" },
    { id: "team_7", name: "Đội 7", members: [{ name: "A.Nhat", level: 2 }, { name: "Kiên Nguyễn", level: 2 }], group: "B" },
    { id: "team_8", name: "Đội 8", members: [{ name: "Lệ", level: 2 }, { name: "Hưng NM", level: 2 }], group: "B" },
    { id: "team_9", name: "Đội 9", members: [{ name: "Kiệt", level: 2 }, { name: "A.Đức", level: 2 }], group: "A" },
  ];

  teams.forEach((team) => {
    const ref = doc(db, "teams", team.id);
    batch.set(ref, team);
  });

  // 2. Matches Data
  const matches = [
    // Group A
    { id: "match_a1", group: "A", team1Id: "team_1", team2Id: "team_5", score1: 0, score2: 0, status: "SCHEDULED", order: 1 },
    { id: "match_a2", group: "A", team1Id: "team_5", team2Id: "team_9", score1: 0, score2: 0, status: "SCHEDULED", order: 2 },
    { id: "match_a3", group: "A", team1Id: "team_4", team2Id: "team_6", score1: 0, score2: 0, status: "SCHEDULED", order: 3 },
    { id: "match_a4", group: "A", team1Id: "team_1", team2Id: "team_9", score1: 0, score2: 0, status: "SCHEDULED", order: 4 },
    { id: "match_a5", group: "A", team1Id: "team_5", team2Id: "team_4", score1: 0, score2: 0, status: "SCHEDULED", order: 5 },
    { id: "match_a6", group: "A", team1Id: "team_9", team2Id: "team_6", score1: 0, score2: 0, status: "SCHEDULED", order: 6 },
    { id: "match_a7", group: "A", team1Id: "team_1", team2Id: "team_4", score1: 0, score2: 0, status: "SCHEDULED", order: 7 },
    { id: "match_a8", group: "A", team1Id: "team_5", team2Id: "team_6", score1: 0, score2: 0, status: "SCHEDULED", order: 8 },
    { id: "match_a9", group: "A", team1Id: "team_9", team2Id: "team_4", score1: 0, score2: 0, status: "SCHEDULED", order: 9 },
    { id: "match_a10", group: "A", team1Id: "team_1", team2Id: "team_6", score1: 0, score2: 0, status: "SCHEDULED", order: 10 },

    // Group B
    { id: "match_b1", group: "B", team1Id: "team_7", team2Id: "team_3", score1: 0, score2: 0, status: "SCHEDULED", order: 1 },
    { id: "match_b2", group: "B", team1Id: "team_3", team2Id: "team_8", score1: 0, score2: 0, status: "SCHEDULED", order: 2 },
    { id: "match_b3", group: "B", team1Id: "team_8", team2Id: "team_2", score1: 0, score2: 0, status: "SCHEDULED", order: 3 },
    { id: "match_b4", group: "B", team1Id: "team_7", team2Id: "team_8", score1: 0, score2: 0, status: "SCHEDULED", order: 4 },
    { id: "match_b5", group: "B", team1Id: "team_3", team2Id: "team_2", score1: 0, score2: 0, status: "SCHEDULED", order: 5 },
    { id: "match_b6", group: "B", team1Id: "team_7", team2Id: "team_2", score1: 0, score2: 0, status: "SCHEDULED", order: 6 },

    // Knockout Matches
    { id: "match_semi1", group: "KO", stage: "SEMI", label: "Bán Kết 1", team1Id: "TBD_A1", team2Id: "TBD_B2", score1: 0, score2: 0, status: "SCHEDULED", order: 101, placeholder1: "Nhất Bảng A", placeholder2: "Nhì Bảng B" },
    { id: "match_semi2", group: "KO", stage: "SEMI", label: "Bán Kết 2", team1Id: "TBD_B1", team2Id: "TBD_A2", score1: 0, score2: 0, status: "SCHEDULED", order: 102, placeholder1: "Nhất Bảng B", placeholder2: "Nhì Bảng A" },
    { id: "match_third", group: "KO", stage: "THIRD", label: "Tranh Hạng 3", team1Id: "TBD_LOSE_S1", team2Id: "TBD_LOSE_S2", score1: 0, score2: 0, status: "SCHEDULED", order: 103, placeholder1: "Thua BK 1", placeholder2: "Thua BK 2" },
    { id: "match_final", group: "KO", stage: "FINAL", label: "Chung Kết", team1Id: "TBD_WIN_S1", team2Id: "TBD_WIN_S2", score1: 0, score2: 0, status: "SCHEDULED", order: 104, placeholder1: "Thắng BK 1", placeholder2: "Thắng BK 2" },
  ];

  matches.forEach((match) => {
    const ref = doc(db, "matches", match.id);
    batch.set(ref, match);
  });

  await batch.commit();
  console.log("Database seeded successfully!");
};


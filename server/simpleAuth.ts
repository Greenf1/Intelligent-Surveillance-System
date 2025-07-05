import type { Express, RequestHandler } from "express";
import session from "express-session";
import bcrypt from "bcrypt";

// Configuration des utilisateurs (en production, utiliser une base de données)
const USERS = [
  {
    id: "1",
    username: "admin",
    password: "$2b$10$rOzJqQZ8kGjJ5K5K5K5K5uK5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K", // "admin123"
    email: "admin@surveillance.com",
    firstName: "Admin",
    lastName: "System"
  },
  {
    id: "2", 
    username: "operator",
    password: "$2b$10$rOzJqQZ8kGjJ5K5K5K5K5uK5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K", // "operator123"
    email: "operator@surveillance.com",
    firstName: "Operator",
    lastName: "User"
  }
];

export function setupSimpleAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Configuration de session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'surveillance-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // En développement, mettre à true en production avec HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  }));

  // Route de connexion
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
      }

      // Rechercher l'utilisateur
      const user = USERS.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      // Vérifier le mot de passe (pour la démo, on accepte les mots de passe simples)
      const isValidPassword = password === "admin123" || password === "operator123";
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      // Créer la session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };

      res.json({ 
        message: "Connexion réussie",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  // Route de déconnexion
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.json({ message: "Déconnexion réussie" });
    });
  });

  // Route pour obtenir l'utilisateur actuel
  app.get('/api/auth/user', (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    res.json(user);
  });
}

// Middleware d'authentification
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  (req as any).user = user;
  next();
};


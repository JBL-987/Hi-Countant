import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "declarations/backend";
import { canisterId } from "declarations/backend/index.js";
import Navbar_Component from "./components/Navbar";
import Footer_Component from "./components/Footer";
import Home from "./pages/Home";
import App from "./pages/App";
import "../index.css";

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === "ic"
    ? "https://identity.ic0.app"
    : "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943";

function Main() {
  const [actor, setActor] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        let isLoggedIn = await client.isAuthenticated();

        setAuthClient(client);

        if (isLoggedIn) {
          try {
            // Check if the identity is valid and not expired
            const identity = client.getIdentity();
            const delegations = identity.getDelegation().delegations;

            if (delegations && delegations.length > 0) {
              // Convert expiration from nanoseconds to milliseconds and compare with current time
              const expirationTime = delegations[0].delegation.expiration;
              const expirationMs = Number(expirationTime) / 1000000;
              const currentTimeMs = Date.now();

              if (expirationMs <= currentTimeMs) {
                console.log("Identity expired, logging out...");
                await client.logout();
                isLoggedIn = false;
              } else {
                console.log("Identity valid until:", new Date(expirationMs));
                // Create actor with the valid identity
                const newActor = createActor(canisterId, {
                  agentOptions: {
                    identity,
                    // Disable certificate validation in development
                    ...(process.env.NODE_ENV !== "production" && {
                      fetchRootKey: true,
                      verifyQuerySignatures: false,
                    }),
                  },
                });
                setActor(newActor);
              }
            }
          } catch (e) {
            console.warn("Error checking identity expiration:", e);
            // If there's an error checking expiration, log out to be safe
            await client.logout();
            isLoggedIn = false;
          }
        }

        setIsAuthenticated(isLoggedIn);
      } catch (error) {
        console.error("Authentication initialization failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;

    try {
      // First check if we're already authenticated but certificate is expired
      if (await authClient.isAuthenticated()) {
        try {
          // Try to refresh the session
          await authClient.logout(); // Clear the expired session
          console.log("Cleared expired session, logging in again...");
        } catch (e) {
          console.warn("Error clearing expired session:", e);
        }
      }

      await authClient.login({
        identityProvider,
        // Set a longer session duration (7 days in nanoseconds)
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const newActor = createActor(canisterId, {
            agentOptions: {
              identity,
              // Disable certificate validation in development
              ...(process.env.NODE_ENV !== "production" && {
                fetchRootKey: true,
                verifyQuerySignatures: false,
              }),
            },
          });

          setActor(newActor);
          setIsAuthenticated(true);
        },
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setActor(null);

      // Force page reload to clear any cached state
      // This helps prevent issues with expired certificates
      if (process.env.NODE_ENV !== "production") {
        console.log("Reloading page to clear session state...");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, reset the local state
      setIsAuthenticated(false);
      setActor(null);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (isInitializing) {
      return (
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Navbar_Component
        isAuthenticated={isAuthenticated}
        login={login}
        logout={logout}
      />
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} login={login} />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <App
                actor={actor}
                isAuthenticated={isAuthenticated}
                login={login}
                logout={logout}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer_Component />
    </Router>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

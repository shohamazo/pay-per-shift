// Mock Supabase client for development
// Replace with actual Supabase client when connected

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    hourly_rate?: number;
  };
}

interface MockSession {
  user: MockUser;
}

interface MockAuthResponse {
  data: { session: MockSession | null; user?: MockUser };
  error: any;
}

const mockUser: MockUser = {
  id: "mock-user-id",
  email: "user@example.com",
  user_metadata: {
    full_name: "משתמש דוגמה",
    hourly_rate: 35,
  }
};

const mockSession: MockSession = {
  user: mockUser
};

export const supabase = {
  auth: {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      // Mock login
      if (credentials.email && credentials.password) {
        return { data: { user: mockUser }, error: null };
      }
      return { data: { user: null }, error: { message: "Invalid credentials" } };
    },
    
    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      // Mock registration
      if (credentials.email && credentials.password) {
        return { data: { user: mockUser }, error: null };
      }
      return { data: { user: null }, error: { message: "Registration failed" } };
    },
    
    signOut: async () => {
      return { error: null };
    },
    
    getSession: async (): Promise<MockAuthResponse> => {
      // Mock session check
      return { data: { session: mockSession }, error: null };
    },
    
    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      // Mock auth state listener
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },
  
  from: (table: string) => ({
    insert: async (data: any) => {
      console.log(`Mock insert to ${table}:`, data);
      return { data, error: null };
    },
    
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        gte: (column: string, value: any) => ({
          lt: (column: string, value: any) => ({
            order: (column: string, options?: any) => {
              const result = async () => {
                // Mock data for shifts
                if (table === 'shifts') {
                  return {
                    data: [
                      {
                        id: "1",
                        date: "2024-01-15",
                        start_time: "09:00",
                        end_time: "17:00",
                        hourly_rate: 35,
                        duration: 8,
                        earnings: 280,
                      },
                      {
                        id: "2", 
                        date: "2024-01-14",
                        start_time: "10:00",
                        end_time: "16:00",
                        hourly_rate: 35,
                        duration: 6,
                        earnings: 210,
                      }
                    ],
                    error: null
                  };
                }
                return { data: [], error: null };
              };
              return result();
            }
          })
        })
      })
    })
  })
};
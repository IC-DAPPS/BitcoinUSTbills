// Basic types for the application
export interface AppConfig {
    environment: "local" | "ic";
    canisterId: string;
}

export interface User {
    principal: string;
    name?: string;
}

export interface ApiResponse<T> {
    Ok?: T;
    Err?: string;
}

// Add more types as needed for your specific application 
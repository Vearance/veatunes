"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface UIContextType {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    queueOpen: boolean;
    toggleQueue: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);

    // load from localStorage
    useEffect(() => {
        try {
            const savedSidebar = localStorage.getItem("ui-sidebar-collapsed");
            if (savedSidebar) setSidebarCollapsed(JSON.parse(savedSidebar));
            const savedQueue = localStorage.getItem("ui-queue-open");
            if (savedQueue) setQueueOpen(JSON.parse(savedQueue));
        } catch (e) {
            console.error("Failed to load UI state:", e);
        }
    }, []);

    // persist
    useEffect(() => {
        localStorage.setItem("ui-sidebar-collapsed", JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    useEffect(() => {
        localStorage.setItem("ui-queue-open", JSON.stringify(queueOpen));
    }, [queueOpen]);

    const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);
    const toggleQueue = useCallback(() => setQueueOpen(prev => !prev), []);

    return (
        <UIContext.Provider value={{ sidebarCollapsed, toggleSidebar, queueOpen, toggleQueue }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error("useUI must be used within a UIProvider");
    return context;
};

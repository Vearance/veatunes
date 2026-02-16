"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface UIContextType {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    queueOpen: boolean;
    toggleQueue: () => void;
    isMobile: boolean;
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (open: boolean) => void;
    toggleMobileSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // detect mobile
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const handler = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
            if (e.matches) {
                setQueueOpen(false);
                setMobileSidebarOpen(false);
            }
        };
        handler(mq);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // load from localStorage
    useEffect(() => {
        try {
            const savedSidebar = localStorage.getItem("ui-sidebar-collapsed");
            if (savedSidebar) setSidebarCollapsed(JSON.parse(savedSidebar));
            const savedQueue = localStorage.getItem("ui-queue-open");
            if (savedQueue && !isMobile) setQueueOpen(JSON.parse(savedQueue));
        } catch (e) {
            console.error("Failed to load UI state:", e);
        }
    }, [isMobile]);

    // persist
    useEffect(() => {
        localStorage.setItem("ui-sidebar-collapsed", JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    useEffect(() => {
        localStorage.setItem("ui-queue-open", JSON.stringify(queueOpen));
    }, [queueOpen]);

    // close mobile sidebar on route change (body scroll lock)
    useEffect(() => {
        if (mobileSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileSidebarOpen]);

    const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);
    const toggleQueue = useCallback(() => {
        if (isMobile) {
            setMobileSidebarOpen(false);
        }
        setQueueOpen(prev => !prev);
    }, [isMobile]);
    const toggleMobileSidebar = useCallback(() => {
        setQueueOpen(false);
        setMobileSidebarOpen(prev => !prev);
    }, []);

    return (
        <UIContext.Provider value={{ sidebarCollapsed, toggleSidebar, queueOpen, toggleQueue, isMobile, mobileSidebarOpen, setMobileSidebarOpen, toggleMobileSidebar }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error("useUI must be used within a UIProvider");
    return context;
};

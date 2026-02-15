import { useRef, useState, useEffect } from "react"

/**
 * Returns a ref to attach to an element and a boolean indicating
 * whether that element is currently in (or has been in) the viewport.
 * Once triggered, stays true (no re-fetch on scroll back).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
    options?: IntersectionObserverInit
): [React.RefObject<T | null>, boolean] {
    const ref = useRef<T | null>(null)
    const [hasBeenVisible, setHasBeenVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el || hasBeenVisible) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasBeenVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1, ...options }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [hasBeenVisible, options])

    return [ref, hasBeenVisible]
}

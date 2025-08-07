// Extend the global Window interface to include updateTickerWith
declare global {
    interface Window {
        updateTickerWith: (text: string) => void;
    }
}

// This line is necessary for your file to be treated as a module
export { };
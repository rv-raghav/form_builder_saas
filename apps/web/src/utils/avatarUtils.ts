export const getInitials = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        const singleName = parts[0];
        // Check for CamelCase/PascalCase (e.g., "SuperAdmin" -> "SA")
        const upperCaseLetters = singleName.match(/[A-Z]/g);
        if (upperCaseLetters && upperCaseLetters.length >= 2) {
            return (upperCaseLetters[0] + upperCaseLetters[upperCaseLetters.length - 1]).toUpperCase();
        }
        // Fallback to first two characters
        return singleName.substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getRandomColor = (name: string): string => {
    if (!name) return '#6366f1'; // Default backup color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // HSL color for better control over saturation and lightness
    // Hue: based on hash
    // Saturation: 65% (consistent vibrancy)
    // Lightness: 45% (ensure white text is readable)
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 45%)`;
};

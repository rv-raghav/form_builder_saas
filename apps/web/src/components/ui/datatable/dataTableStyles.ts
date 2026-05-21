import DataTable, { TableColumn, createTheme } from 'react-data-table-component';
import styled from 'styled-components';

// Create custom dark theme
createTheme('creativeDashDark', {
    text: {
        primary: 'rgba(255, 255, 255, 0.9)',
        secondary: 'rgba(255, 255, 255, 0.7)',
    },
    background: {
        default: 'transparent',
    },
    context: {
        background: '#1e40af',
        text: '#FFFFFF',
    },
    divider: {
        default: 'rgba(255, 255, 255, 0.05)',
    },
    action: {
        button: 'rgba(255, 255, 255, 0.4)',
        hover: 'rgba(255, 255, 255, 0.08)',
        disabled: 'rgba(255, 255, 255, 0.12)',
    },
    highlightOnHover: {
        default: 'rgba(255, 255, 255, 0.05)',
        text: 'rgba(255, 255, 255, 0.9)',
    },
    sortFocus: {
        default: 'rgba(59, 130, 246, 0.5)',
    },
}, 'dark');

// Create custom light theme
createTheme('creativeDashLight', {
    text: {
        primary: 'rgb(31, 41, 55)',
        secondary: 'rgb(107, 114, 128)',
    },
    background: {
        default: 'transparent',
    },
    context: {
        background: '#3b82f6',
        text: '#FFFFFF',
    },
    divider: {
        default: 'rgb(229, 231, 235)',
    },
    action: {
        button: 'rgba(0, 0, 0, 0.4)',
        hover: 'rgba(0, 0, 0, 0.04)',
        disabled: 'rgba(0, 0, 0, 0.12)',
    },
    highlightOnHover: {
        default: 'rgba(0, 0, 0, 0.04)',
        text: 'rgb(31, 41, 55)',
    },
    sortFocus: {
        default: 'rgba(59, 130, 246, 0.5)',
    },
}, 'default');

// Custom styles for the DataTable
export const customStyles = {
    table: {
        style: {
            backgroundColor: 'transparent',
        },
    },
    headRow: {
        style: {
            borderBottomWidth: '1px',
            minHeight: '48px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
        },
    },
    headCells: {
        style: {
            paddingLeft: '12px',
            paddingRight: '12px',
            '&:hover': {
                cursor: 'pointer',
            },
        },
    },
    rows: {
        style: {
            minHeight: '56px',
            fontSize: '0.875rem',
            '&:not(:last-of-type)': {
                borderBottomWidth: '1px',
            },
        },
        highlightOnHoverStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderBottomColor: 'transparent',
            outline: 'none',
        },
    },
    cells: {
        style: {
            paddingLeft: '12px',
            paddingRight: '12px',
        },
    },
    pagination: {
        style: {
            borderTopWidth: '1px',
            minHeight: '52px',
            fontSize: '0.875rem',
        },
    },
    noData: {
        style: {
            padding: '48px',
            fontSize: '0.875rem',
        },
    },
    progress: {
        style: {
            padding: '48px',
        },
    },
};

// Search input container
export const SearchContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
`;

// Search input styling
export const SearchInput = styled.input`
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.875rem;
    width: 280px;
    outline: none;
    transition: all 0.2s ease;
    
    &::placeholder {
        color: rgb(156, 163, 175);
    }
    
    /* Light mode */
    background-color: white;
    border: 1px solid rgb(209, 213, 219);
    color: rgb(31, 41, 55);
    
    &:focus {
        border-color: rgb(59, 130, 246);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    /* Dark mode - handled via className */
    .dark & {
        background-color: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        
        &:focus {
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        &::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
    }
`;

// Table wrapper for consistent styling
export const TableWrapper = styled.div`
    border-radius: 12px;
    overflow: hidden;
    
    /* Light mode */
    background-color: white;
    border: 1px solid rgb(229, 231, 235);
    
    /* Dark mode */
    .dark & {
        background-color: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.05);
    }
`;

// Export types and component
export { DataTable };
export type { TableColumn };

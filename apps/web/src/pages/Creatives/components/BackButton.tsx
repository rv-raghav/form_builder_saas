// Enhanced Back navigation button with modern design
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/button/Button';

interface BackButtonProps {
    to: string;
    label?: string;
}

export default function BackButton({ to, label = 'Back' }: BackButtonProps) {
    const navigate = useNavigate();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(to)}
            startIcon={
                <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            }
        >
            {label}
        </Button>
    );
}

// src/pages/AuthPages/SignIn.tsx
import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import SignInForm from '../../components/auth/SignInForm';

export default function SignIn() {
    // PublicRoute handles redirect if already authenticated
    return (
        <>
            <PageMeta
                title="Sign In | ChaiForms"
                description="Login to access the ChaiForms dashboard"
            />
            <AuthLayout>
                <SignInForm />
            </AuthLayout>
        </>
    );
}

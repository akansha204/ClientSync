import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordClient';

// This is a simple UI that shows while your form is loading
function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-500">
            <p>Loading...</p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
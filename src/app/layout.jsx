import './globals.css';
import ToastContainer from '../components/Toast.jsx';
import DevBadgeRemover from '../components/DevBadgeRemover.jsx';
import VoiceAssistant from '../components/VoiceAssistant.jsx';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Sahara • সাঁকো • सहारा - Everyday Cognitive & Caregiver Companion',
  description: 'Dignified, calming cognitive support and daily routine companion for elderly loved ones and family caregivers across North East India.',
  icons: {
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADfY8uUCdflx3PxgJV8n5Rdy5e1UqyJi1RpuX07Bmc9r6hn23Klt8mhC0O57Dlsy0AoO2Zfur4kxn9yueS6kMU1-B3o_rUnCtsYE80rKVOILi3Gl6wxP62ffyGjvNMaoafsux-4Nu3YfcznSLtBj71fvQApLWucdiSJyE4VD5KSm1AryUPF0ooW09SbgA3OdWj_0EfL0E3tOmeMY4frF7WwHEp3O9blDcLXakfekbdhrlgiYNNcO0c2Q',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24..48,400..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#ebffe7] text-[#032109] antialiased min-h-screen">
        <DevBadgeRemover />
        {children}
        <VoiceAssistant />
        <ToastContainer />
      </body>
    </html>
  );
}

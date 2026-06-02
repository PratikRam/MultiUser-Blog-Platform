import Navbar from '@/src/components/navbar';
import Footer from '@/src/components/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
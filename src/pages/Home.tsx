import { Hero } from '../components/Hero';
import { Stats } from '../components/Stats';
import { Features } from '../components/Features';
import { Pricing } from '../components/Pricing';
import { Contact } from '../components/Contact';
import { MainLayout } from '../layouts/MainLayout';

export const Home = () => {
    return (
        <MainLayout>
            <Hero />
            <Stats />
            <Features />
            <Pricing />
            <Contact />
        </MainLayout>
    );
};

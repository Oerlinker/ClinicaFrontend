
import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import About from "../components/About";
import Contact from "../components/Contact";

const Index = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <Hero />
                <Services />
                <About />
                <Contact />
            </main>
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>© {new Date().getFullYear()} EyeHub Clinic. All rights reserved.</p>
                    <div className="mt-2 flex justify-center space-x-4">
                        <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Accessibility</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
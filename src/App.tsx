import React from "react";
import { Coffee } from "lucide-react";
import RetailPos from "./components/RetailPOS";
const App: React.FC = () => {
    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <RetailPos />
        </div>
    );
};

export default App;

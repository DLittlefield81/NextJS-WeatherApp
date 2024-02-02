'use client'
import React, { useState } from "react";
import { MdGpsFixed, MdOutlineLocationOn } from "react-icons/md";
import { TiWeatherWindyCloudy } from "react-icons/ti";
import SearchBox from "./SearchBox";
import axios from "axios";


type Props = {};


export default function Navbar({ }: Props) {
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    //
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false)

    async function handleInputChange(value: string) {
        setCity(value);
        if (value.length >= 3) {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
                );
                const suggestions = response.data.list.map((item: any) => item.name);
                setSuggestions(suggestions);
                setError('')
                setShowSuggestions(true);
            } catch (error) { }
            setSuggestions([])
            setShowSuggestions(false);
        } else {
            setSuggestions([])
            setShowSuggestions(false);
        }
    }

    function handleSuggestionClick(value: string) {
        setCity(value);
        setShowSuggestions(false);
    }

    function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (suggestions.length === 0) {
            setError("Please enter a valid city name.");
            setShowSuggestions(false);
        }
        else
        {
            setError("");
            }
    }

    return (
        < nav className="shadow-sm sticky top-0 left-0 z-50 bg-white" >
            <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-gray-500 text-3xl">Weather</h2>
                    <TiWeatherWindyCloudy className="text-3xl mt-1 text-blue-500" />
                </div>
                {/** */}
                <section className="flex gap-2 items-center">
                    <MdGpsFixed className="text-2xl text-gray-500 hover:opacity-80 cursor-pointer" />
                    <MdOutlineLocationOn className="text-3xl text-black" />
                    <p className="text-slate-900/80 text-sm">Toronto, Canada</p>
                    <div>
                        {/* Searchbox */}
                        <SearchBox
                            value={city}
                            onSubmit={(e) =>}
                            onChange={(e) => handleInputChange(e.target.value)}
                        />
                        <SuggestionBox {...{
                            showSuggestions,
                            suggestions,
                            handleSuggestionClick,
                            error
                        }} />
                    </div>
                </section>
            </div>
        </nav >
    );
}

function SuggestionBox({
    showSuggestions,
    suggestions,
    handleSuggestionClick,
    error
}: {
    showSuggestions: boolean;
    suggestions: string[];
    handleSuggestionClick: (item: string) => void;
    error: string;
}) {
    return (
        <>
            {((showSuggestions && suggestions.length > 1) || error) && (
                <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2">
                    {error && suggestions.length < 1 && (
                        <li className="text-red-500 p-1">{error}</li>
                    )}
                    {suggestions.map((item, i) => (
                        <li
                            key={i}
                            className="cursor-pointer p-1 rounded hover:bg-gray-200"
                            onClick={() => handleSuggestionClick(item)}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

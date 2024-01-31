'use client'

import Container from "@/components/Container";
import Navbar from "@/components/Navbar";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherInfo[];
  city: CityInfo;
}

interface WeatherInfo {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: WeatherDetail[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherDetail {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface CityInfo {
  id: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}


export default function Home() {

  const { isPending, error, data } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=toronto&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }
  })
  const firstData = data?.list[0]
  console.log("data", data);
  if (isPending) return
  <div className="flex items-center min-h-screen justify-center">
    <p className="animate-bounce">Loading ...</p>
  </div>

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* TodayData */}
        <section>
          <div>
            <h2 className="flex gap-1 text-2xl items-end">
              <p>
                {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}
              </p>
              <p className="text-lg">
                {format(parseISO(firstData?.dt_txt ?? ""), "yyyy-MM-dd ")}
              </p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData?.main?.temp ?? 0)}&deg;
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span >
                    Feels Like
                  </span>
                  <span>
                    {convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}&deg;
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}&deg;&#8595;{""}
                  </span>
                  <span>
                    {""}{convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}&deg;&#8593;
                  </span>
                </p>
              </div>
            </Container>

          </div>
        </section>
        {/* 7 Day Data */}
        <section>

        </section>
      </main>
    </div>
  )
}













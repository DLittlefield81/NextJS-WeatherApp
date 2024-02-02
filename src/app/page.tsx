'use client'

import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { metersToKilometers } from "@/utils/metersToKilometers";
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
        `https://api.openweathermap.org/data/2.5/forecast?q=toronto&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=24`
      );
      return data;
    }
  })

  const firstData = data?.list[0]

  console.log("data", data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  // filter data for first entry after 6am for each date
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find(
      (entry) => {
        const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
        const entryTime = new Date(entry.dt * 1000).getHours();
        return entryDate === date && entryTime >= 6;
      });
  });

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
              {/* Time and weather icon */}
              <div className="flex gap-10 sm:gap-15 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((d, i) => (
                  <div key={i}
                    className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                    <p className="whitespace-nowrap">
                      {format(parseISO(d.dt_txt), 'h:mm a')}
                    </p>
                    <WeatherIcon iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)} />
                    <p>
                      {convertKelvinToCelsius(d?.main.temp ?? 0)}&deg;
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4 mt-5">
            {/* left */}
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">
                {firstData?.weather[0].description}
              </p>
              <WeatherIcon
                iconName={getDayOrNightIcon(
                  firstData.weather[0].icon ?? "",
                  firstData.dt_txt ?? ""
                )}
              />

            </Container>
            {/* right */}
            <Container className="bg-yellow-300/80  px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails
                visability={metersToKilometers(
                  firstData?.visibility ?? 10000
                )}
                airPressure={`${firstData?.main.pressure} hPa`}
                humidity={`${firstData?.main.humidity}%`}
                sunrise={format(
                  fromUnixTime(data?.city.sunrise ?? 1702949452),
                  "H:mm"
                )}
                sunset={format(
                  fromUnixTime(data?.city.sunset ?? 1702517657),
                  "H:mm"
                )}
                windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
              />
            </Container>
          </div>
        </section>
        {/* 7 Day Data */}
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">
            Forecast (7 days)
          </p>
          {firstDataForEachDate.map((d, i) => (
            <ForecastWeatherDetail
              key={i}
              description={d?.weather[0].description ?? ""}
              weatherIcon={d?.weather[0].icon ?? "01d"}
              date={format(parseISO(d?.dt_txt ?? ''), "dd.MM")}
              day={format(parseISO(d?.dt_txt ?? ''), "EEEE")}
              feels_like={d?.weather[0].feels_like ?? 0}
              temp={d?.weather[0].temp ?? 0}
              temp_max={d?.weather[0].temp_max ?? 0}
              temp_min={d?.weather[0].temp_min ?? 0}
              airPressure={`${d?.main.pressure} hPa`}
              humidity={`${d?.main.humidity} %`}
              sunrise={format(
                fromUnixTime(data?.city.sunrise ?? 1702517657),
                "H:mm"
              )}
              sunset={format(
                fromUnixTime(data?.city.sunset ?? 1702517657),
                "H:mm"
              )}
              visability={`${metersToKilometers(d?.visability ?? 10000)}`}
              windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}

            />
          ))}
        </section>
      </main>
    </div>
  )
}













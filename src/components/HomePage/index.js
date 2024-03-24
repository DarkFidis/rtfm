import ThemeCard from "../ThemeCard";
import {themes} from "../../config/constants";

export default function HomePage() {
  return (
      <div className="container">
          <div className="row">
              { themes.map((theme, index) => (
                  <ThemeCard {...theme} key={index} />
              ))}
          </div>
      </div>
  );
}

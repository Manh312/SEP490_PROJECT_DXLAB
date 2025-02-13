import { resourcesLinks, platformLinks, communityLinks } from "../constants";
const Footer = () => {
  return (
    // <div className="max-w-7xl mx-auto pt-20 px-6">
      <footer className="border-t py-10 border-neutral-700 max-w-8xl mx-auto pt-20 px-6 pl-15 ">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <h3 className="text-md font-semibold mb-4">
            Resources
          </h3>
          <ul className="space-y-2">
            {resourcesLinks.map((link, index) => (
              <li key={index}>
                <a className="hover:text-gray-400" href={link.href}>
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-4">
            Platform
          </h3>
          <ul className="space-y-2">
            {platformLinks.map((link, index) => (
              <li key={index}>
                <a className="hover:text-gray-400" href={link.href}>
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-4">
            Community
          </h3>
          <ul className="space-y-2">
            {communityLinks.map((link, index) => (
              <li key={index}>
                <a className="hover:text-gray-400" href={link.href}>
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-4">
            Community
          </h3>
          <ul className="space-y-2">
            {communityLinks.map((link, index) => (
              <li key={index}>
                <a className="hover:text-gray-400" href={link.href}>
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
    // </div>
  );
}

export default Footer;

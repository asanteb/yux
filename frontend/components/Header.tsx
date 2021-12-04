import { Text } from "@arwes/core";

const Header = () => {
  return (
    <div className="main-header">
      <Text as="h1" animator={{ manager: "stagger" }}>
        yux.watch
      </Text>
      <a
        className="source-code-link vertical-center"
        href="https://github.com/asanteb/yux"
      >
        <div
          style={{ width: "24px", marginBottom: "-4px", marginRight: "6px" }}
        >
          <span className="material-icons">code</span>
        </div>
        <div>Source Code</div>
      </a>
    </div>
  );
};

export default Header;

import { Text, Card, Button } from "@arwes/core";
import { useNavigate } from "react-router-dom";

export const RoomItem = ({ id, img, name, description }) => {
  let navigate = useNavigate();

  const joinRoom = () => {
    navigate({
      pathname: "/room",
      search: `?id=${id}`,
    });
  };
  return (
    <div className="room">
      <Card
        animator={{ manager: "stagger" }}
        image={{
          src: img,
          alt: name,
        }}
        title={name}
        options={
          <Button palette="secondary" onClick={() => joinRoom()}>
            <Text>join Room</Text>
          </Button>
        }
        style={{ maxWidth: 400 }}
      >
        <Text>{description}</Text>
      </Card>
    </div>
  );
};

const RoomList = ({ list = [] }) => {
  return (
    <div className="room-list">
      {list.map((room) => (
        <RoomItem
          id={room.id}
          key={room.id}
          img={room.image}
          name={room.name}
          description={room.description}
        />
      ))}
    </div>
  );
};

export default RoomList;

import { Text, Card, Button } from "@arwes/core";

export const Room = ({ id, img, name, description }) => {
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
          <Button palette="secondary">
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
        <Room
          id={room.id}
          img={room.img}
          name={room.name}
          description={room.description}
        />
      ))}
    </div>
  );
};

export default RoomList;

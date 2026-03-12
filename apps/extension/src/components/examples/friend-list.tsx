import { useLiveQuery } from "dexie-react-hooks";
import { dexie } from "@/lib/dexie";

type FriendListProps = {
  minAge: number;
  maxAge: number;
};

export function FriendList({ minAge, maxAge }: FriendListProps) {
  const friends = useLiveQuery(async () => {
    const friends = await dexie.friends
      .where("age")
      .between(minAge, maxAge)
      .toArray();
    return friends;
  }, [minAge, maxAge]);

  return (
    <div className="space-y-2">
      <h2 className="font-medium">
        Friend List (Age {minAge} - {maxAge})
      </h2>
      <ul className="list-inside list-disc">
        {friends?.map((friend) => (
          <li key={friend.id}>
            {friend.name}, {friend.age}
          </li>
        ))}
      </ul>
    </div>
  );
}

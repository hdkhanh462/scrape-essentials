import { AddFriendForm } from "@/components/examples/add-friend-form";
import { FriendList } from "@/components/examples/friend-list";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DexieExample() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <CardTitle>Dexie Example</CardTitle>
      </CardHeader>
      <CardContent>
        <AddFriendForm />
      </CardContent>
      <CardFooter>
        <FriendList minAge={18} maxAge={65} />
      </CardFooter>
    </Card>
  );
}

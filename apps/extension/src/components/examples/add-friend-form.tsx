import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormInput, FormNumberInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { dexie } from "@/lib/dexie";

const friendSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z
    .number("Age must be a number")
    .min(1, "Age must be at least 1")
    .max(150, "Age must be at most 150"),
});

type FriendInput = z.infer<typeof friendSchema>;

type AddFriendFormProps = {
  defaultAge?: number;
};

export function AddFriendForm({ defaultAge = 23 }: AddFriendFormProps) {
  const form = useForm<FriendInput>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: "",
      age: defaultAge,
    },
  });

  async function onSubmit(data: FriendInput) {
    console.log(data);

    const id = await dexie.friends.add({
      ...data,
    });

    console.log(id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Friend</CardTitle>
        <CardDescription>
          Use the form below to add a new friend to your list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="friend-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput
              control={form.control}
              name="name"
              label="Name"
              inputProps={{
                placeholder: "Enter your friend's name",
                autoComplete: "off",
              }}
            />
            <FormNumberInput
              control={form.control}
              name="age"
              label="Age"
              inputProps={{
                placeholder: "Enter your friend's age",
                autoComplete: "off",
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="friend-form">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

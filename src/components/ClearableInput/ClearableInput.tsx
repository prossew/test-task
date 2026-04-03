import { TextInput } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  mb?: string | number;
  type?: string;
  borderColor?: string;
};

export default function ClearableInput({
  value,
  onChange,
  mb,
  type,
  borderColor,
}: Props) {
  return (
    <TextInput
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      mb={mb}
      type={type}
      rightSection={
        value ? (
          <IconX
            size={14}
            color="gray"
            style={{ cursor: "pointer" }}
            onClick={() => onChange("")}
          />
        ) : null
      }
      styles={{
        input: { borderColor: borderColor },
      }}
    />
  );
}

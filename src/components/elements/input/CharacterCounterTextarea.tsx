import { Textarea, Text, TextareaProps, Flex } from "@mantine/core";

interface CharacterCounterTextareaProps extends TextareaProps {
  maxLength?: number;
  label?: string;
  placeholder?: string;
}

const CharacterCounterTextarea: React.FC<CharacterCounterTextareaProps> = ({
  maxLength = 200,
  label = "Description",
  placeholder,
  value,
  onChange,
  ...props
}) => {
  const valueString = typeof value === "string" ? value : "";
  const remainingCharacters = maxLength - valueString.length;

  return (
    <Flex direction="column" gap={8} className="relative">
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        autosize
        minRows={2}
        maxRows={5}
        {...props}
      />
      <Text
        fz={14}
        ta="right"
        c={remainingCharacters <= 0 ? "#ED4245" : "#969696"}
      >
        <span className="font-bold">{remainingCharacters}</span> characters left
      </Text>
    </Flex>
  );
};

export default CharacterCounterTextarea;

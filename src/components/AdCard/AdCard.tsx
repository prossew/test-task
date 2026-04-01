import { Badge, Box, Card, Image, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Item } from "../../types/item";

const CATEGORY_LABELS: Record<string, string> = {
  auto: "Авто",
  real_estate: "Недвижимость",
  electronics: "Электроника",
};

type Props = {
  item: Item;
};

function AdCard({ item }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      shadow="xs"
      padding="sm"
      radius="md"
      withBorder
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/ads/${item.id}`)}
    >
      <Card.Section>
        <Image
          src={item.imageUrl ?? null}
          fallbackSrc="https://placehold.co/300x200?text=Нет+фото"
          height={160}
          alt={item.title}
        />
      </Card.Section>
      <Box mt="sm">
        <Badge variant="outline" color="gray" size="sm" radius="sm" tt="none">
          {CATEGORY_LABELS[item.category]}
        </Badge>
        <Text fw={500} mt={6} lineClamp={2}>
          {item.title}
        </Text>
        <Text fw={700} mt={4}>
          {item.price.toLocaleString("ru-RU")} ₽
        </Text>

        {item.needsRevision && (
          <Badge color="orange" variant="light" mt={6} size="sm" tt="none">
            • Требует доработок
          </Badge>
        )}
      </Box>
    </Card>
  );
}
export default AdCard;

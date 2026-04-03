import { Badge, Box, Card, Image, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { ItemListItem } from "../../types/api";

const CATEGORY_LABELS: Record<string, string> = {
  auto: "Авто",
  real_estate: "Недвижимость",
  electronics: "Электроника",
};

const FALLBACK_IMG =
  "https://media.istockphoto.com/id/1980276924/ru/%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F/%D0%BD%D0%B5%D1%82-%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B3%D0%BE-%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%B0-%D0%BC%D0%B8%D0%BD%D0%B8%D0%B0%D1%82%D1%8E%D1%80%D1%8B-%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D0%B8-%D0%B2-%D0%B3%D0%B0%D0%BB%D0%B5%D1%80%D0%B5%D0%B5-%D0%B8%D0%BB%D0%B8-%D0%B0%D0%BB%D1%8C%D0%B1%D0%BE%D0%BC%D0%B5-%D0%BD%D0%B5%D1%82-%D0%BD%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B3%D0%BE-%D0%B8%D0%BB%D0%B8.jpg?s=612x612&w=0&k=20&c=Uyer4BYXPwDhqbqI_8LGAVDpH_qog-ih6CzGnxvZhLY=";

type Props = {
  item: ItemListItem;
  viewMode?: "grid" | "list";
};

function AdCard({ item, viewMode = "grid" }: Props) {
  const navigate = useNavigate();
  const isList = viewMode === "list";

  return (
    <Card
      shadow="xs"
      padding="sm"
      radius={16}
      withBorder
      style={{
        cursor: "pointer",
        display: isList ? "flex" : "block",
        flexDirection: isList ? "row" : undefined,
        alignItems: isList ? "center" : undefined,
        gap: isList ? 24 : undefined,
      }}
      onClick={() => navigate(`/ads/${item.id}`)}
    >
      <Card.Section
        style={{
          width: isList ? 179 : "auto",
          height: isList ? 132 : "auto",
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: isList ? 8 : undefined,
        }}
      >
        <Image
          src={null}
          fallbackSrc={FALLBACK_IMG}
          height={isList ? 132 : 150}
          width={isList ? 179 : undefined}
          style={{
            borderRadius: isList ? 8 : "0 0 8px 8px",
            objectFit: "cover",
          }}
          alt={item.title}
        />
      </Card.Section>

      <Box style={{ flex: 1 }}>
        {!isList && (
          <Box style={{ marginTop: -12, paddingLeft: 12 }}>
            <Badge
              variant="outline"
              size="xs"
              radius="sm"
              tt="none"
              style={{
                color: "rgba(0, 0, 0, 0.85)",
                borderColor: "#D9D9D9",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                display: "inline",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 400,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              {CATEGORY_LABELS[item.category]}
            </Badge>
          </Box>
        )}

        {isList && (
          <Badge
            variant="transparent"
            ml={-10}
            tt="none"
            style={{
              color: "#848388",
              display: "inline",
              fontSize: 14,
              fontWeight: 400,
            }}
          >
            {CATEGORY_LABELS[item.category]}
          </Badge>
        )}

        <Text fw={400} lineClamp={2} mt={4}>
          {item.title}
        </Text>
        <Text fw={400} mt={4} c="dimmed">
          {item.price.toLocaleString("ru-RU")} ₽
        </Text>

        {item.needsRevision && (
          <Badge
            mt={4}
            tt="none"
            style={{
              color: "#FAAD14",
              backgroundColor: "#F9F1E6",
              fontSize: 14,
              fontWeight: 400,
              display: "inline-block",
              minHeight: 22,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FAAD14",
                marginRight: 8,
                display: "inline-block",
              }}
            />
            Требует доработок
          </Badge>
        )}
      </Box>
    </Card>
  );
}

export default AdCard;

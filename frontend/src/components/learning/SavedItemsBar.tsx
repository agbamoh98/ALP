import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Bookmark, BookmarkAdded, Delete, Refresh } from "@mui/icons-material";

export interface SavedItem {
  id: string;
  title: string;
  count: number;
  createdAt: string;
}

interface SavedItemsBarProps {
  label: string;
  items: SavedItem[];
  selectedId: string | null;
  saving?: boolean;
  saved?: boolean;
  onSelect: (id: string) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  canSave: boolean;
  used?: number;
  max?: number;
  perItemMax?: number;
  perItemLabel?: string;
  autoSave?: boolean;
}

export default function SavedItemsBar({
  label,
  items,
  selectedId,
  saving,
  saved,
  onSelect,
  onSave,
  onDelete,
  onRefresh,
  canSave,
  used,
  max,
  perItemMax,
  perItemLabel,
  autoSave,
}: SavedItemsBarProps) {
  const atLimit = used !== undefined && max !== undefined && used >= max;

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: "rgba(108, 99, 255, 0.03)",
        border: "1px solid rgba(108, 99, 255, 0.1)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: items.length ? 1.5 : 0, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Saved {label}
          </Typography>
          {used !== undefined && max !== undefined && (
            <Typography variant="caption" color={atLimit ? "error.main" : "text.secondary"}>
              {used}/{max} saved{perItemMax && perItemLabel ? ` · up to ${perItemMax} ${perItemLabel}` : ""}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh list">
            <IconButton size="small" onClick={onRefresh}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          {autoSave ? (
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", px: 1 }}>
              {saved ? "Auto-saved (Free plan)" : saving ? "Saving…" : "Auto-saves on generate"}
            </Typography>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={saved ? <BookmarkAdded /> : <Bookmark />}
              onClick={onSave}
              disabled={!canSave || saving || saved || atLimit}
              sx={{ textTransform: "none" }}
            >
              {saving ? "Saving…" : saved ? "Saved" : atLimit ? "Limit reached" : "Save to Library"}
            </Button>
          )}
        </Stack>
      </Box>

      {items.length > 0 ? (
        <FormControl size="small" fullWidth>
          <InputLabel>Load saved {label.toLowerCase()}</InputLabel>
          <Select
            value={selectedId ?? ""}
            label={`Load saved ${label.toLowerCase()}`}
            onChange={(e) => onSelect(e.target.value)}
            renderValue={(id) => {
              const item = items.find((i) => i.id === id);
              return item ? `${item.title} (${item.count})` : "";
            }}
          >
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.count} items · {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Alert severity="info" sx={{ py: 0.5, borderRadius: 2 }}>
          {atLimit
            ? `You've reached your plan limit of ${max} saved ${label.toLowerCase()}. Delete one to save more.`
            : `No saved ${label.toLowerCase()} yet for this resource.`}
        </Alert>
      )}
    </Box>
  );
}

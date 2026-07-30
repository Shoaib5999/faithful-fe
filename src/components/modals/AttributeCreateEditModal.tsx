import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiStepModal } from "@/components/common/MultiStepModal";
import { DragHandle } from "@/components/common/DragHandle";
import { SortableItem } from "@/components/common/SortableItem";
import { InlineAlert } from "@/components/common/InlineAlert";
import { useModal } from "@/hooks/useModal";
import { useAttribute } from "@/hooks/useAttribute";
import {
  generateCode,
  generateSlug,
  generateId,
} from "@/lib/formatters";
import { isRequired } from "@/lib/validators";
import type {
  Attribute,
  AttributeOption,
  AttributeType,
  FormErrors,
} from "@/types/master.types";
import { Plus, Trash2 } from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type OptionDraft = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
};

export const AttributeCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useAttribute();

  const existing = payload.attribute as Attribute | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [code, setCode] = useState(existing?.code ?? "");
  const [codeManual, setCodeManual] = useState(false);
  const [type, setType] = useState<AttributeType>(
    existing?.type ?? "text"
  );
  const [isRequiredField, setIsRequiredField] = useState(
    existing?.isRequired ?? false
  );
  const [isFilterable, setIsFilterable] = useState(
    existing?.isFilterable ?? false
  );

  const [options, setOptions] = useState<OptionDraft[]>(
    existing?.values ?? []
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNameChange = (v: string) => {
    setName(v);
    if (!codeManual) setCode(generateCode(v));
  };

  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    if (!isRequired(type)) e.type = "Type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStepChange = (step: number) => {
    if (step > 0 && !validateStep1()) return;
    setCurrentStep(step);
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: generateId(),
        label: "",
        value: "",
        sortOrder: prev.length,
      },
    ]);
  };

  const updateOption = (
    id: string,
    field: "label" | "value",
    val: string
  ) => {
    setOptions((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;

        if (field === "label") {
          return {
            ...o,
            label: val,
            value: generateSlug(val),
          };
        }

        return { ...o, value: val };
      })
    );
  };

  const removeOption = (id: string) => {
    setOptions((prev) =>
      prev
        .filter((o) => o.id !== id)
        .map((o, i) => ({ ...o, sortOrder: i }))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOptions((prev) => {
      const oldIndex = prev.findIndex((o) => o.id === active.id);
      const newIndex = prev.findIndex((o) => o.id === over.id);

      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);

      return next.map((o, i) => ({
        ...o,
        sortOrder: i,
      }));
    });
  };

  const handleComplete = async () => {
    if (!validateStep1()) return;

    const hasOptions =
      type === "select" || type === "multiselect";

    const payload = {
      name,
      code: code || generateCode(name),
      type,
      isRequired: isRequiredField,
      isFilterable,
      isActive: true,

      options: hasOptions
        ? options.map((o) => ({
          label: o.label,
          value: o.value,
          sortOrder: o.sortOrder,
        }))
        : [],
    };

    if (isEdit && existing) {
      await handleUpdate(existing.id, payload);
    } else {
      await handleCreate(payload);
    }
  };

  const hasOptionType =
    type === "select" || type === "multiselect";

  const steps = [
    {
      title: "Details",
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label>Code</Label>
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeManual(true);
              }}
              className=""
            />
          </div>

          <div>
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as AttributeType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="multiselect">
                  Multi-select
                </SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={isRequiredField}
                onCheckedChange={setIsRequiredField}
              />
              <Label>Required</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isFilterable}
                onCheckedChange={setIsFilterable}
              />
              <Label>Filterable</Label>
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Options",
      content: hasOptionType ? (
        <div className="flex flex-col gap-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={options.map((o) => o.id)}
              strategy={verticalListSortingStrategy}
            >
              {options.map((opt) => (
                <SortableItem key={opt.id} id={opt.id}>
                  {({ listeners, attributes }) => (
                    <div className="flex gap-2 border p-2 rounded">
                      <DragHandle
                        listeners={listeners}
                        attributes={attributes}
                      />

                      <Input
                        value={opt.label}
                        onChange={(e) =>
                          updateOption(
                            opt.id,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Label"
                      />

                      <Input
                        value={opt.value}
                        onChange={(e) =>
                          updateOption(
                            opt.id,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Value"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(opt.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Option
          </Button>
        </div>
      ) : (
        <InlineAlert
          type="info"
          message="Options only available for select type attributes"
        />
      ),
    },
  ];

  return (
    <MultiStepModal
      open
      onClose={closeModal}
      steps={steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      completeLabel={isEdit ? "Update" : "Create"}
      isCompleting={isLoading}
    />
  );
};
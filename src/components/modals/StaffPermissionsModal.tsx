import React, { useState, useEffect, useMemo } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useStaff } from "@/hooks/useStaff";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MODULE_KEYS_ARRAY, OPERATIONS, MODULE_LABELS } from "@/constants/permissions.constants";
import type { ModuleKey, Operation } from "@/constants/permissions.constants";
import type { Staff } from "@/types/staff.types";
import type { StaffPermission } from "@/types/auth.types";

type PermMatrix = Record<ModuleKey, Set<Operation>>;

const initMatrix = (permissions: StaffPermission[]): PermMatrix => {
  const matrix = {} as PermMatrix;
  MODULE_KEYS_ARRAY.forEach((mk) => {
    matrix[mk] = new Set();
  });
  permissions.forEach((p) => {
    if (matrix[p.moduleKey]) {
      p.operations.forEach((op) => matrix[p.moduleKey].add(op));
    }
  });
  return matrix;
};

const matrixToPermissions = (matrix: PermMatrix): StaffPermission[] =>
  MODULE_KEYS_ARRAY.filter((mk) => matrix[mk].size > 0).map((mk) => ({
    moduleKey: mk,
    operations: Array.from(matrix[mk]),
  }));

export const StaffPermissionsModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const { handleUpdatePermissions } = useStaff();
  const { openModal } = useModal();
  const staff = payload?.staff as Staff | undefined;

  const [matrix, setMatrix] = useState<PermMatrix>(() => initMatrix(staff?.permissions ?? []));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) setMatrix(initMatrix(staff.permissions));
  }, [staff]);

  const originalPerms = useMemo(
    () => JSON.stringify(matrixToPermissions(initMatrix(staff?.permissions ?? []))),
    [staff],
  );
  const hasChanges = JSON.stringify(matrixToPermissions(matrix)) !== originalPerms;

  const toggleCell = (mk: ModuleKey, op: Operation) => {
    setMatrix((prev) => {
      const next = { ...prev, [mk]: new Set(prev[mk]) };
      next[mk].has(op) ? next[mk].delete(op) : next[mk].add(op);
      return next;
    });
  };

  const toggleRow = (mk: ModuleKey) => {
    setMatrix((prev) => {
      const allChecked = OPERATIONS.every((op) => prev[mk].has(op));
      const next = { ...prev, [mk]: new Set(allChecked ? [] : [...OPERATIONS]) };
      return next;
    });
  };

  const toggleColumn = (op: Operation) => {
    setMatrix((prev) => {
      const allChecked = MODULE_KEYS_ARRAY.every((mk) => prev[mk].has(op));
      const next = { ...prev };
      MODULE_KEYS_ARRAY.forEach((mk) => {
        next[mk] = new Set(prev[mk]);
        allChecked ? next[mk].delete(op) : next[mk].add(op);
      });
      return next;
    });
  };

  const grantAll = () => {
    const next = {} as PermMatrix;
    MODULE_KEYS_ARRAY.forEach((mk) => {
      next[mk] = new Set([...OPERATIONS]);
    });
    setMatrix(next);
  };

  const revokeAll = () => {
    const next = {} as PermMatrix;
    MODULE_KEYS_ARRAY.forEach((mk) => {
      next[mk] = new Set();
    });
    setMatrix(next);
  };

  const handleSave = async () => {
    if (!staff) return;
    setSaving(true);
    await handleUpdatePermissions(staff.id, matrixToPermissions(matrix));
    setSaving(false);
    closeModal();
  };

  const handleClose = () => {
    if (hasChanges) {
      openModal("ConfirmAction", {
        title: "Unsaved Changes",
        description: "You have unsaved changes. Are you sure you want to close?",
        onConfirm: () => closeModal(),
      });
    } else {
      closeModal();
    }
  };

  const permCount = MODULE_KEYS_ARRAY.filter((mk) => matrix[mk].size > 0).length;

  return (
    <ResponsiveModal
      open={activeKey === "StaffPermissions"}
      onOpenChange={() => handleClose()}
      title={`Permissions — ${staff?.firstName ?? ""} ${staff?.lastName ?? ""}`}
      description={`${permCount} module(s) with permissions`}
      className="sm:max-w-4xl"
    >
      <div className="flex flex-col gap-4">
        {hasChanges && (
          <Badge variant="secondary" className="w-fit">
            Unsaved changes
          </Badge>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={grantAll}>
            Grant All
          </Button>
          <Button variant="outline" size="sm" onClick={revokeAll}>
            Revoke All
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">Module</th>
                {OPERATIONS.map((op) => (
                  <th key={op} className="px-3 py-2 text-center font-medium capitalize">
                    <div className="flex flex-col items-center gap-1">
                      <span>{op}</span>
                      <Checkbox
                        checked={MODULE_KEYS_ARRAY.every((mk) => matrix[mk].has(op))}
                        onCheckedChange={() => toggleColumn(op)}
                      />
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium">All</th>
              </tr>
            </thead>
            <tbody>
              {MODULE_KEYS_ARRAY.map((mk) => (
                <tr key={mk} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{MODULE_LABELS[mk]}</td>
                  {OPERATIONS.map((op) => (
                    <td key={op} className="px-3 py-2 text-center">
                      <Checkbox
                        checked={matrix[mk].has(op)}
                        onCheckedChange={() => toggleCell(mk, op)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <Checkbox
                      checked={OPERATIONS.every((op) => matrix[mk].has(op))}
                      onCheckedChange={() => toggleRow(mk)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => handleClose()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Eye, Loader2, Palette, Save, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveEmailTemplate, saveEmailTheme } from "@/actions/emailTemplates";
import { renderOrderEmail } from "@/lib/email/order-templates";
import {
  HEX_COLOR,
  LIMITS,
  PLACEHOLDERS,
  SAMPLE_ORDER,
  TEMPLATE_KEYS,
  TEMPLATE_META,
  THEME_FIELDS,
  unknownPlaceholders,
} from "@/lib/email/template-config";
import { cn } from "@/lib/utils";

const TEXTAREA_CLASS =
  "flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

const pick = (t) => ({ subject: t.subject, heading: t.heading, body: t.body });

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {children}
    </p>
  );
}

function Counter({ value, max }) {
  return (
    <span className={cn("text-[11px] tabular-nums", value.length > max ? "text-destructive" : "text-neutral-400")}>
      {value.length}/{max}
    </span>
  );
}

function ColorField({ name, label, value, onChange, error }) {
  const valid = HEX_COLOR.test(value);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`color-${name}`} className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={valid ? value : "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
        />
        <Input
          id={`color-${name}`}
          value={value}
          onChange={(event) => onChange(event.target.value.trim())}
          maxLength={7}
          className="h-9 font-mono text-xs uppercase"
          aria-invalid={error || !valid ? true : undefined}
        />
      </div>
      <FieldError id={`color-${name}-error`}>{error ?? (valid ? null : "Use a colour like #1B9DDB.")}</FieldError>
    </div>
  );
}

/**
 * /admin/templates: per-email subject/heading/body, shared colours and
 * header text, with a live preview rendered by the same code that sends
 * the real emails (lib/email/order-templates.js) using a sample order.
 */
export default function   EmailTemplateEditor({ initialTemplates, initialTheme }) {
  const [activeKey, setActiveKey] = useState(TEMPLATE_KEYS[0]);
  const [saved, setSaved] = useState(() =>
    Object.fromEntries(TEMPLATE_KEYS.map((k) => [k, pick(initialTemplates[k])]))
  );
  const [drafts, setDrafts] = useState(saved);
  const [savedTheme, setSavedTheme] = useState(initialTheme);
  const [theme, setTheme] = useState(initialTheme);
  const [templateErrors, setTemplateErrors] = useState({});
  const [themeErrors, setThemeErrors] = useState({});
  const [savingTemplate, startTemplateSave] = useTransition();
  const [savingTheme, startThemeSave] = useTransition();

  // Where a clicked placeholder gets inserted.
  const lastField = useRef({ name: "body", start: null, end: null });
  const inputs = { subject: useRef(null), heading: useRef(null), body: useRef(null) };

  const draft = drafts[activeKey];
  const templateDirty = TEMPLATE_KEYS.filter((k) => JSON.stringify(drafts[k]) !== JSON.stringify(saved[k]));
  const themeDirty = JSON.stringify(theme) !== JSON.stringify(savedTheme);
  const availablePlaceholders = Object.entries(PLACEHOLDERS).filter(([, p]) => p.templates.includes(activeKey));

  // Live warnings for placeholders this email can't fill.
  const warnings = Object.fromEntries(
    ["subject", "heading", "body"].map((field) => {
      const bad = unknownPlaceholders(draft[field], activeKey);
      return [field, bad.length ? `{{${bad.join("}}, {{")}}} can't be used in this email.` : null];
    })
  );

  const preview = useMemo(() => {
    const safeTheme = Object.fromEntries(
      Object.entries(theme).map(([k, v]) => [k, k === "header_title" || HEX_COLOR.test(v) ? v : savedTheme[k]])
    );
    return renderOrderEmail(activeKey, SAMPLE_ORDER, { template: draft, theme: safeTheme });
  }, [activeKey, draft, theme, savedTheme]);

  function updateDraft(field, value) {
    setDrafts((previous) => ({ ...previous, [activeKey]: { ...previous[activeKey], [field]: value } }));
    setTemplateErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function remember(field, event) {
    lastField.current = { name: field, start: event.target.selectionStart, end: event.target.selectionEnd };
  }

  function insertPlaceholder(name) {
    const { name: field, start, end } = lastField.current;
    const value = draft[field];
    const token = `{{${name}}}`;
    const from = start ?? value.length;
    const to = end ?? value.length;
    updateDraft(field, value.slice(0, from) + token + value.slice(to));
    const caret = from + token.length;
    lastField.current = { name: field, start: caret, end: caret };
    requestAnimationFrame(() => {
      const el = inputs[field].current;
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  }

  function saveTemplate() {
    startTemplateSave(async () => {
      const result = await saveEmailTemplate({ key: activeKey, ...draft });
      if (result?.fieldErrors) {
        setTemplateErrors(result.fieldErrors);
        return;
      }
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setSaved((previous) => ({ ...previous, [activeKey]: draft }));
      setTemplateErrors({});
      toast.success(`${TEMPLATE_META[activeKey].label} email saved.`);
    });
  }

  function saveTheme() {
    startThemeSave(async () => {
      const result = await saveEmailTheme(theme);
      if (result?.fieldErrors) {
        setThemeErrors(result.fieldErrors);
        return;
      }
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const normalised = Object.fromEntries(
        Object.entries(theme).map(([k, v]) => [k, k === "header_title" ? v.trim() : v.toUpperCase()])
      );
      setTheme(normalised);
      setSavedTheme(normalised);
      setThemeErrors({});
      toast.success("Colours saved for all emails.");
    });
  }

  const textField = (field, label) => (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={`tpl-${field}`}>{label}</Label>
        <Counter value={draft[field]} max={LIMITS[field]} />
      </div>
      {field === "body" ? (
        <textarea
          ref={inputs.body}
          id="tpl-body"
          rows={7}
          value={draft.body}
          onChange={(event) => updateDraft("body", event.target.value)}
          onSelect={(event) => remember("body", event)}
          onFocus={(event) => remember("body", event)}
          className={cn(TEXTAREA_CLASS, "min-h-40 resize-y")}
          aria-invalid={templateErrors.body || warnings.body ? true : undefined}
          aria-describedby="tpl-body-error"
        />
      ) : (
        <Input
          ref={inputs[field]}
          id={`tpl-${field}`}
          value={draft[field]}
          onChange={(event) => updateDraft(field, event.target.value)}
          onSelect={(event) => remember(field, event)}
          onFocus={(event) => remember(field, event)}
          aria-invalid={templateErrors[field] || warnings[field] ? true : undefined}
          aria-describedby={`tpl-${field}-error`}
        />
      )}
      <FieldError id={`tpl-${field}-error`}>{templateErrors[field] ?? warnings[field]}</FieldError>
    </div>
  );

  return (
    <>
        <Tabs value={activeKey} onValueChange={(value) => { setActiveKey(value); setTemplateErrors({}); }}>
          <TabsList className="w-full sm:w-auto">
            {TEMPLATE_KEYS.map((key) => (
              <TabsTrigger key={key} value={key} className="cursor-pointer px-3">
                {TEMPLATE_META[key].label}
                {templateDirty.includes(key) ? (
                  <span className="size-1.5 rounded-full bg-amber-500" aria-label="unsaved changes" />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)]">
      <div className="space-y-6">

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Type className="size-4 text-brand" />
              {TEMPLATE_META[activeKey].label} email
            </CardTitle>
            <CardDescription>{TEMPLATE_META[activeKey].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {textField("subject", "Subject")}
            {textField("heading", "Heading")}
            {textField("body", "Body text")}
            <p className="text-xs text-neutral-400">Leave a blank line between paragraphs.</p>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-neutral-600">
                Insert a placeholder (filled in for each order):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availablePlaceholders.map(([name, meta]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => insertPlaceholder(name)}
                    title={meta.label}
                    className="cursor-pointer rounded-sm border bg-neutral-50 px-2 py-1 font-mono text-[11px] text-neutral-700 transition-colors hover:border-brand hover:text-brand"
                  >
                    {`{{${name}}}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="button"
                onClick={saveTemplate}
                disabled={savingTemplate || !templateDirty.includes(activeKey)}
                className="cursor-pointer rounded-sm px-3 text-xs"
              >
                {savingTemplate ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save {TEMPLATE_META[activeKey].label} email
              </Button>
              {templateDirty.includes(activeKey) ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setDrafts((p) => ({ ...p, [activeKey]: saved[activeKey] })); setTemplateErrors({}); }}
                  className="cursor-pointer rounded-sm px-3 text-xs"
                >
                  Discard changes
                </Button>
              ) : (
                <span className="text-xs text-neutral-400">All changes saved</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="size-4 text-brand" />
              Brand &amp; colours
            </CardTitle>
            <CardDescription>Shared by all three emails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="theme-header_title">Header bar text</Label>
                <Counter value={theme.header_title} max={LIMITS.header_title} />
              </div>
              <Input
                id="theme-header_title"
                value={theme.header_title}
                onChange={(event) => setTheme((t) => ({ ...t, header_title: event.target.value }))}
                aria-invalid={themeErrors.header_title ? true : undefined}
              />
              <FieldError id="theme-header_title-error">{themeErrors.header_title}</FieldError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(THEME_FIELDS).map(([field, label]) => (
                <ColorField
                  key={field}
                  name={field}
                  label={label}
                  value={theme[field]}
                  error={themeErrors[field]}
                  onChange={(value) => {
                    setTheme((t) => ({ ...t, [field]: value }));
                    setThemeErrors((e) => ({ ...e, [field]: undefined }));
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="button"
                onClick={saveTheme}
                disabled={savingTheme || !themeDirty}
                className="cursor-pointer rounded-sm px-3 text-xs"
              >
                {savingTheme ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save colours
              </Button>
              {themeDirty ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setTheme(savedTheme); setThemeErrors({}); }}
                  className="cursor-pointer rounded-sm px-3 text-xs"
                >
                  Discard changes
                </Button>
              ) : (
                <span className="text-xs text-neutral-400">All changes saved</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit gap-0 rounded-sm p-0 xl:sticky xl:top-4">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="size-4 text-brand" />
            Live preview
            <span className="font-normal text-neutral-400">— sample order</span>
          </CardTitle>
          <p className="truncate text-xs text-neutral-600">
            <span className="text-neutral-400">Subject:</span> <span data-testid="preview-subject">{preview.subject}</span>
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <iframe
            title="Email preview"
            srcDoc={preview.html}
            sandbox=""
            className="h-[720px] w-full border-0 bg-[#f4f5f7]"
          />
        </CardContent>
      </Card>
    </div>
    </>
  );
}

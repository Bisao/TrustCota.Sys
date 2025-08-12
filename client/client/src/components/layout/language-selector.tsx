
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder={t('language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="pt">{t('portuguese')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

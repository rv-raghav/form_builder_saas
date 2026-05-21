import Button from '../../../../../../components/ui/button/Button';
import Label from '../../../../../../components/form/Label';
import Input from '../../../../../../components/form/input/InputField';
import { PlusIcon, TrashIcon } from '../../../../../../icons';
import { useToast } from '../../../../../../context/ToastContext';

interface CtaButton {
    title: string;
    target_url: string;
    image: string;
    image_name?: string;
}

interface Props {
    buttons: CtaButton[];
    onButtonsChange: (buttons: CtaButton[]) => void;
    onImageUpload: (file: File, callback: (base64: string, filename: string) => void) => void;
    errors: Record<string, string>;
}

export default function CtaButtonsSection({ buttons, onButtonsChange, onImageUpload, errors }: Props) {
    const { showToast } = useToast();

    const addButton = () => {
        if (buttons.length >= 5) {
            showToast('Maximum 5 CTA buttons allowed', 'warning');
            return;
        }
        onButtonsChange([...buttons, { title: '', target_url: '', image: '', image_name: '' }]);
    };

    const removeButton = (index: number) => {
        if (buttons.length <= 2) {
            showToast('Minimum 2 CTA buttons required', 'warning');
            return;
        }
        onButtonsChange(buttons.filter((_, i) => i !== index));
    };

    const updateButton = (index: number, field: keyof CtaButton, value: string) => {
        onButtonsChange(buttons.map((btn, i) =>
            i === index ? { ...btn, [field]: value } : btn
        ));
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    CTA Buttons ({buttons.length}/5)
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addButton}
                    disabled={buttons.length >= 5}
                    startIcon={<PlusIcon className="w-4 h-4" />}
                >
                    Add Button
                </Button>
            </div>
            <div className="space-y-4">
                {buttons.map((btn, index) => (
                    <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Button {index + 1}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeButton(index)}
                                disabled={buttons.length <= 2}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor={`cta-title-${index}`}>Title</Label>
                                <Input
                                    id={`cta-title-${index}`}
                                    name={`cta-title-${index}`}
                                    type="text"
                                    value={btn.title}
                                    onChange={(e) => updateButton(index, 'title', e.target.value)}
                                    placeholder="Amazon"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`cta-url-${index}`}>
                                    URL <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    id={`cta-url-${index}`}
                                    name={`cta-url-${index}`}
                                    type="url"
                                    value={btn.target_url}
                                    onChange={(e) => updateButton(index, 'target_url', e.target.value)}
                                    placeholder="https://..."
                                    error={!!errors[`cta_buttons.${index}.target_url`]}
                                    hint={errors[`cta_buttons.${index}.target_url`]}
                                />
                            </div>
                            <div>
                                <Label htmlFor={`cta-image-${index}`}>Button Image</Label>
                                <input
                                    id={`cta-image-${index}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        e.target.files?.[0] &&
                                        onImageUpload(e.target.files[0], (b64, filename) => {
                                            const newButtons = [...buttons];
                                            newButtons[index] = { 
                                                ...newButtons[index], 
                                                image: b64, 
                                                image_name: filename 
                                            };
                                            onButtonsChange(newButtons);
                                        })
                                    }
                                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-brand-50 file:text-brand-700"
                                />
                                {btn.image && (
                                    <img src={btn.image} alt="Button preview" className="mt-1 h-8 object-contain" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

import React, { useCallback, useEffect, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { cn } from '../utils';
import Button from './button';

type Props = {
    isOpen?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    body?: React.ReactElement;
    footer?: React.ReactElement;
    actionLabel: string;
    disabled?: boolean;
    secondaryAction?: () => void;
    secondaryLabel?: string;
};

const Modal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    footer,
    actionLabel,
    disabled,
    secondaryAction,
    secondaryLabel,
}) => {
    const [showModal, setShowModal] = useState<boolean | undefined>(isOpen);

    const scrollBarWidth =
        typeof window !== 'undefined'
            ? window.innerWidth - document.body.clientWidth
            : null;

    const disableScroll = () => {
        document.body.style.maxWidth = `calc(100vw - ${scrollBarWidth}px)`;
        document.body.style.overflow = 'hidden';
    };
    const enableScroll = () => {
        document.body.style.maxWidth = 'unset';
        document.body.style.overflow = 'auto';
    };

    useEffect(() => {
        if (showModal) {
            disableScroll();
        }
        return () => {
            enableScroll();
        };
    }, [showModal]);

    useEffect(() => {
        setShowModal(isOpen);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        if (disabled) {
            return;
        }
        setShowModal(false);

        onClose();
    }, [disabled, onClose]);

    const handleSubmit = useCallback(() => {
        if (disabled) {
            return;
        }
        onSubmit();
    }, [disabled, onSubmit]);

    const handleSecondaryAction = useCallback(() => {
        if (disabled || !secondaryAction) {
            return;
        }
        secondaryAction();
    }, [disabled, secondaryAction]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-neutral-800/70 outline-none focus:outline-none">
            <div className="relative mx-auto my-6 h-full w-full md:h-auto md:w-4/6 lg:h-auto lg:w-3/6 xl:w-2/5">
                <div
                    className={cn(
                        'h-full',
                        showModal ? 'opacity-100' : 'opacity-0'
                    )}
                >
                    <div className="translate relative flex h-full w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none md:h-auto lg:h-auto">
                        <div className="relative flex items-center justify-center rounded-t border-b-[1px] p-6">
                            {/* eslint-disable-next-line */}
                            <button
                                className="absolute left-9 border-0 p-1 transition hover:opacity-70"
                                onClick={handleClose}
                                type="button"
                            >
                                <CloseOutlined size={18} />
                            </button>
                            <div className="text-lg font-semibold">{title}</div>
                        </div>
                        <div className="relative flex-auto p-6">{body}</div>
                        <div className="flex flex-col gap-2 p-6">
                            <div className="flex w-full items-center gap-4">
                                {secondaryAction && secondaryLabel && (
                                    <Button
                                        disabled={disabled}
                                        label={secondaryLabel}
                                        onClick={handleSecondaryAction}
                                        outline
                                    />
                                )}

                                <Button
                                    disabled={disabled}
                                    label={actionLabel}
                                    onClick={handleSubmit}
                                />
                            </div>
                            {footer}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Modal.defaultProps = {
    isOpen: undefined,
    title: undefined,
    body: undefined,
    footer: undefined,
    disabled: undefined,
    secondaryAction: undefined,
    secondaryLabel: undefined,
};

export default Modal;

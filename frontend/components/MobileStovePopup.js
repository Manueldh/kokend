'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flame } from "lucide-react";
import DigitalStove from './DigitalStove';

export default function MobileStovePopup({ recipe, onStepComplete }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full h-16 px-6 bg-orange-600 hover:bg-orange-700 shadow-lg flex items-center space-x-2"
            >
              <Flame className="h-6 w-6" />
              <div className="text-center">
                <div className="text-sm font-semibold">Fornuis</div>
                <div className="text-xs opacity-90">Timers</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <span>Digitaal Fornuis</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <DigitalStove recipe={recipe} onStepComplete={onStepComplete} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
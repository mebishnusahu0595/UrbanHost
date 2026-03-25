"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FiFileText, FiCheckCircle } from "react-icons/fi";

interface AgreementPageProps {
    onAccept: () => void;
    onBack: () => void;
}

export default function AgreementPage({ onAccept, onBack }: AgreementPageProps) {
    const [agreed, setAgreed] = useState(false);
    const [readTerms, setReadTerms] = useState(false);

    const handleAccept = () => {
        if (agreed && readTerms) {
            onAccept();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    URBANHOST Property Partner Agreement
                </h1>
                <p className="text-gray-600">
                    Please review and accept the terms to complete your registration
                </p>
            </div>

            {/* Agreement Content */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="prose max-w-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>

                        <div className="space-y-4 text-sm text-gray-700 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">1. Commission & Payment Settlement</h3>
                                <p>
                                    URBANHOST will charge a commission of 15-20% on each confirmed booking.
                                    Payments will be settled on a monthly basis, within 7 working days after month-end.
                                    All transactions will be processed through the registered bank account provided during onboarding.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">2. Cancellation Policy</h3>
                                <p>
                                    Properties must adhere to the cancellation policy selected during registration.
                                    Standard policy allows free cancellation up to 24 hours before check-in.
                                    Any changes to the policy must be communicated and approved by URBANHOST.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">3. Property Standards</h3>
                                <p>
                                    Partners must maintain property standards as per the listing description.
                                    Regular quality audits may be conducted. Failure to maintain standards may result in
                                    listing suspension or termination of partnership.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">4. Guest Safety & Compliance</h3>
                                <p>
                                    Partners must comply with all local laws and regulations, including maintaining guest registers,
                                    police verification processes, and safety certifications. Partners are responsible for guest safety
                                    during their stay.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">5. Pricing & Availability</h3>
                                <p>
                                    Partners must keep pricing and room availability updated in real-time.
                                    Rate parity must be maintained across all booking platforms.
                                    URBANHOST reserves the right to offer promotional discounts with prior notice.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">6. Customer Service</h3>
                                <p>
                                    Partners must provide 24/7 contact availability for guest support.
                                    Response time for guest queries should not exceed 2 hours.
                                    Professional conduct and hospitality standards must be maintained at all times.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">7. Intellectual Property</h3>
                                <p>
                                    Partners grant URBANHOST the right to use property images, descriptions, and information
                                    for marketing purposes. URBANHOST retains all rights to its brand, logo, and platform.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">8. Termination</h3>
                                <p>
                                    Either party may terminate this agreement with 30 days written notice.
                                    URBANHOST reserves the right to immediately suspend listings in case of policy violations,
                                    guest complaints, or fraudulent activities.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">9. Liability</h3>
                                <p>
                                    Partners are solely responsible for property maintenance, guest safety, and any incidents
                                    occurring on the premises. URBANHOST acts as a booking platform and is not liable for
                                    property-related issues.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">10. Data Privacy</h3>
                                <p>
                                    Both parties agree to maintain confidentiality of customer data and comply with
                                    applicable data protection laws. Guest information must not be shared with third parties
                                    without consent.
                                </p>
                            </section>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Checkboxes */}
            <Card className="mb-6">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="read-terms"
                            checked={readTerms}
                            onCheckedChange={(checked) => setReadTerms(checked as boolean)}
                        />
                        <label
                            htmlFor="read-terms"
                            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                        >
                            I have read and understood all the terms and conditions mentioned above
                        </label>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="agree-terms"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        />
                        <label
                            htmlFor="agree-terms"
                            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                        >
                            I agree to the URBANHOST Property Partner Agreement, Commission & Payment Settlement Terms,
                            and Cancellation Policy. I understand that this is a legally binding agreement.
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={onBack}
                >
                    Back to Documents
                </Button>

                <Button
                    onClick={handleAccept}
                    disabled={!agreed || !readTerms}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                    <FiCheckCircle className="w-4 h-4 mr-2" />
                    Accept & Submit
                </Button>
            </div>

            {/* Info Box */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <p className="text-sm text-blue-900">
                        <strong>Note:</strong> By accepting this agreement, your property will be submitted for review.
                        Our team will verify all documents and details within 2-3 business days.
                        You will receive login credentials via email once approved.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

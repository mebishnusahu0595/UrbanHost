"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FiImage,
  FiHome,
  FiSettings,
  FiCreditCard
} from "react-icons/fi";
import { MdRoomService } from "react-icons/md";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Listing submitted!
          </h1>
          <p className="text-gray-600">
            We've received your listing! Next, we'll review your listing and provide you with feedback within 1 working day.
          </p>
        </div>

        {/* Next Steps Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Next, make your property stand out!
          </h2>

          <div className="space-y-3">
            {/* Room Types & Rate Plans */}
            <Link href="/property-owner/properties" className="block">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <MdRoomService className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Room types & rate plans</h3>
                  <p className="text-sm text-gray-600">Add room details and pricing</p>
                </div>
              </div>
            </Link>

            {/* Add More Photos */}
            <Link href="/property-owner/properties" className="block">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <FiImage className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Add more photos</h3>
                  <p className="text-sm text-gray-600">Upload high-quality images of your property</p>
                </div>
              </div>
            </Link>

            {/* Facilities */}
            <Link href="/property-owner/properties" className="block">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <FiSettings className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Facilities</h3>
                  <p className="text-sm text-gray-600">Add amenities and services</p>
                </div>
              </div>
            </Link>

            {/* Settlements */}
            <Link href="/property-owner/properties" className="block">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                  <FiCreditCard className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Settlements</h3>
                  <p className="text-sm text-gray-600">Set up payment and settlement details</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-6">
          <Link href="/property-owner/properties" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold">
              Add last few details (25%)
            </Button>
          </Link>
        </div>

        {/* Alternative Actions */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <FiHome className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a href="mailto:kuberhoteliers@gmail.com" className="text-blue-600 hover:underline font-medium">
              kuberhoteliers@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
